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
        e.id, 
        e.date, 
        e.category, 
        e.amount, 
        e.description, 
        e.user_id, 
        e.budget_id,
        e.created_at,
        e.updated_at,
        b.name as budget_name
      FROM expenses e
      LEFT JOIN budgets b ON e.budget_id = b.id
      WHERE e.user_id = ? 
      ORDER BY e.date DESC, e.created_at DESC`,
      [user.userId],
    )

    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching expenses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = getUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { date, category, amount, description, budgetId } = await request.json()

    if (!date || !category || !amount) {
      return NextResponse.json({ error: "Date, category, and amount are required" }, { status: 400 })
    }

    // Validate amount is positive
    if (Number(amount) <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 })
    }

    // Validate category exists in our predefined categories
    const [categoryCheck] = await pool.execute(
      "SELECT id FROM categories WHERE name = ? AND (user_id IS NULL OR user_id = ?)",
      [category, user.userId],
    )

    if ((categoryCheck as any[]).length === 0) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    // If budgetId is provided, validate it belongs to the user
    if (budgetId) {
      const [budgetCheck] = await pool.execute("SELECT id FROM budgets WHERE id = ? AND user_id = ?", [
        budgetId,
        user.userId,
      ])

      if ((budgetCheck as any[]).length === 0) {
        return NextResponse.json({ error: "Invalid budget" }, { status: 400 })
      }
    }

    const [result] = (await pool.execute(
      "INSERT INTO expenses (date, category, amount, description, user_id, budget_id) VALUES (?, ?, ?, ?, ?, ?)",
      [date, category, Number(amount), description || "", user.userId, budgetId || null],
    )) as any

    return NextResponse.json({
      id: result.insertId,
      message: "Expense added successfully",
    })
  } catch (error) {
    console.error("Error adding expense:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
