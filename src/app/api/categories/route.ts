import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUser } from "@/lib/middleware"

export async function GET(request: NextRequest) {
  const user = getUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get all categories (global + user-specific)
    const [rows] = await pool.execute(
      `SELECT 
        id, 
        name, 
        user_id,
        created_at
      FROM categories 
      WHERE user_id IS NULL OR user_id = ?
      ORDER BY name ASC`,
      [user.userId],
    )

    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = getUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    // Check if category already exists for this user
    const [existing] = await pool.execute(
      "SELECT id FROM categories WHERE name = ? AND (user_id IS NULL OR user_id = ?)",
      [name.trim(), user.userId],
    )

    if ((existing as any[]).length > 0) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 })
    }

    const [result] = (await pool.execute("INSERT INTO categories (name, user_id) VALUES (?, ?)", [
      name.trim(),
      user.userId,
    ])) as any

    return NextResponse.json({
      id: result.insertId,
      message: "Category created successfully",
    })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
