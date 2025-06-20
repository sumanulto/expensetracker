import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUser } from "@/lib/middleware"

export async function GET(request: NextRequest) {
  const user = getUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const [rows] = await pool.execute("SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC", [user.userId])

    return NextResponse.json(rows)
  } catch (error) {
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

    const [result] = (await pool.execute(
      "INSERT INTO expenses (date, category, amount, description, user_id, budget_id) VALUES (?, ?, ?, ?, ?, ?)",
      [date, category, amount, description, user.userId, budgetId || null],
    )) as any

    return NextResponse.json({
      id: result.insertId,
      message: "Expense added successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
