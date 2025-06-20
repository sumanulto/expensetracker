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
      `SELECT 
        category, 
        SUM(amount) as total,
        COUNT(*) as count,
        AVG(amount) as average
      FROM expenses 
      WHERE user_id = ? 
      GROUP BY category
      ORDER BY total DESC`,
      [user.userId],
    )

    // Expenses over time (monthly)
    const [timeData] = await pool.execute(
      `SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        SUM(amount) as total,
        COUNT(*) as count
      FROM expenses 
      WHERE user_id = ? 
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month ASC`,
      [user.userId],
    )

    // Recent expenses
    const [recentExpenses] = await pool.execute(
      `SELECT 
        id, 
        date, 
        category, 
        amount, 
        description,
        created_at
      FROM expenses 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 10`,
      [user.userId],
    )

    // Budget vs actual spending (for active budget)
    const [budgetAnalysis] = await pool.execute(
      `SELECT 
        bc.category_name,
        bc.allocated_amount,
        COALESCE(SUM(e.amount), 0) as spent_amount,
        (bc.allocated_amount - COALESCE(SUM(e.amount), 0)) as remaining_amount
      FROM budgets b
      JOIN budget_categories bc ON b.id = bc.budget_id
      LEFT JOIN expenses e ON bc.budget_id = e.budget_id AND bc.category_name = e.category
      WHERE b.user_id = ? AND b.is_active = TRUE
      GROUP BY bc.id, bc.category_name, bc.allocated_amount`,
      [user.userId],
    )

    return NextResponse.json({
      categoryData,
      timeData,
      recentExpenses,
      budgetAnalysis,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
