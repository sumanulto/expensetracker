import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUser } from "@/lib/middleware"

export async function GET(request: NextRequest) {
  const user = getUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const [rows] = (await pool.execute("SELECT * FROM budgets WHERE user_id = ? AND is_active = TRUE LIMIT 1", [
      user.userId,
    ])) as any

    if (rows.length === 0) {
      return NextResponse.json({ message: "No active budget found" }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Error fetching active budget:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
