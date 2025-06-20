import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUser } from "@/lib/middleware"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const [budgetRows] = (await pool.execute(
      `SELECT 
        id, 
        name, 
        monthly_income, 
        start_date, 
        end_date, 
        is_active, 
        created_at, 
        updated_at
      FROM budgets 
      WHERE id = ? AND user_id = ?`,
      [id, user.userId],
    )) as any

    if (budgetRows.length === 0) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 })
    }

    const [categoryRows] = await pool.execute(
      `SELECT 
        id, 
        category_name, 
        allocated_amount, 
        created_at, 
        updated_at
      FROM budget_categories 
      WHERE budget_id = ?`,
      [id],
    )

    const [expenseRows] = (await pool.execute(
      `SELECT 
        category, 
        SUM(amount) as spent 
      FROM expenses 
      WHERE budget_id = ? 
      GROUP BY category`,
      [id],
    )) as any

    const budget = budgetRows[0]
    budget.categories = categoryRows
    budget.expenses = expenseRows

    return NextResponse.json(budget)
  } catch (error) {
    console.error("Error fetching budget details:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const { name, monthlyIncome, startDate, endDate, categories } = body

    // Validate required fields
    if (!name || !monthlyIncome || !startDate || !endDate) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Validate amounts
    if (Number(monthlyIncome) <= 0) {
      return NextResponse.json({ error: "Monthly income must be greater than 0" }, { status: 400 })
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (start >= end) {
      return NextResponse.json({ error: "End date must be after start date" }, { status: 400 })
    }

    // Start transaction
    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      // Update budget
      const [result] = (await connection.execute(
        "UPDATE budgets SET name = ?, monthly_income = ?, start_date = ?, end_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
        [name, Number(monthlyIncome), startDate, endDate, id, user.userId],
      )) as any

      if (result.affectedRows === 0) {
        await connection.rollback()
        connection.release()
        return NextResponse.json({ error: "Budget not found or not authorized" }, { status: 404 })
      }

      // Delete existing budget categories
      await connection.execute("DELETE FROM budget_categories WHERE budget_id = ?", [id])

      // Insert updated budget categories if provided
      if (categories && Array.isArray(categories) && categories.length > 0) {
        for (const category of categories) {
          if (category.name && Number(category.amount) >= 0) {
            // Validate category exists
            const [categoryCheck] = await connection.execute(
              "SELECT id FROM categories WHERE name = ? AND (user_id IS NULL OR user_id = ?)",
              [category.name, user.userId],
            )

            if ((categoryCheck as any[]).length > 0) {
              await connection.execute(
                "INSERT INTO budget_categories (budget_id, category_name, allocated_amount) VALUES (?, ?, ?)",
                [id, category.name, Number(category.amount)],
              )
            }
          }
        }
      }

      await connection.commit()
      connection.release()

      return NextResponse.json({
        message: "Budget updated successfully",
        success: true,
      })
    } catch (error) {
      await connection.rollback()
      connection.release()
      throw error
    }
  } catch (error) {
    console.error("Budget update error:", error)
    return NextResponse.json({ error: "Failed to update budget" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const { is_active } = body

    // Start transaction
    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      // If setting this budget as active, first deactivate all other budgets for this user
      if (is_active) {
        await connection.execute(
          "UPDATE budgets SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?",
          [user.userId],
        )
      }

      // Update the specific budget
      const [result] = (await connection.execute(
        "UPDATE budgets SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
        [is_active, id, user.userId],
      )) as any

      await connection.commit()
      connection.release()

      if (result.affectedRows === 0) {
        return NextResponse.json({ error: "Budget not found or not authorized" }, { status: 404 })
      }

      return NextResponse.json({ message: "Budget updated successfully" })
    } catch (error) {
      await connection.rollback()
      connection.release()
      throw error
    }
  } catch (error) {
    console.error("Error updating budget:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const [result] = (await pool.execute("DELETE FROM budgets WHERE id = ? AND user_id = ?", [id, user.userId])) as any

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Budget not found or not authorized" }, { status: 404 })
    }

    return NextResponse.json({ message: "Budget deleted successfully" })
  } catch (error) {
    console.error("Error deleting budget:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
