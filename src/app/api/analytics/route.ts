import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUser } from "@/lib/middleware"

export async function GET(request: NextRequest) {
  const user = getUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Expenses by category
    const [categoryData] = await pool.execute(
      "SELECT category, SUM(amount) as total FROM expenses WHERE user_id = ? GROUP BY category",
      [user.userId],
    )

    // Expenses over time (monthly)
    const [timeData] = await pool.execute(
      `SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        SUM(amount) as total 
      FROM expenses 
      WHERE user_id = ? 
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month`,
      [user.userId],
    )

    return NextResponse.json({
      categoryData,
      timeData,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
