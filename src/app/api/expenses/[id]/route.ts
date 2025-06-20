import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUser } from "@/lib/middleware"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = getUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await pool.execute("DELETE FROM expenses WHERE id = ? AND user_id = ?", [params.id, user.userId])

    return NextResponse.json({ message: "Expense deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
