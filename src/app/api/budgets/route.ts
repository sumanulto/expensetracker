import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUser } from "@/lib/middleware"

export async function GET(request: NextRequest) {
  const user = getUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const [rows] = await pool.execute(
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
      WHERE user_id = ? 
      ORDER BY created_at DESC`,
      [user.userId],
    )

    return NextResponse.json(rows)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = getUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name, monthlyIncome, startDate, endDate, categories } = await request.json()

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
      // Insert budget
      const [result] = (await connection.execute(
        "INSERT INTO budgets (name, monthly_income, start_date, end_date, user_id, is_active) VALUES (?, ?, ?, ?, ?, ?)",
        [name, Number(monthlyIncome), startDate, endDate, user.userId, false],
      )) as any

      const budgetId = result.insertId

      // Insert budget categories if provided
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
                "INSERT INTO budget_categories (budget_id, category_name, allocated_amount) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE allocated_amount = VALUES(allocated_amount)",
                [budgetId, category.name, Number(category.amount)],
              )
            }
          }
        }
      }

      await connection.commit()
      connection.release()

      return NextResponse.json({
        id: budgetId,
        message: "Budget created successfully",
      })
    } catch (error) {
      await connection.rollback()
      connection.release()
      throw error
    }
  } catch (error) {
    console.error("Budget creation error:", error)
    return NextResponse.json({ error: "Failed to create budget" }, { status: 500 })
  }
}
