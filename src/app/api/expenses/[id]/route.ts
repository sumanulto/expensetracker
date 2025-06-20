// src/app/api/expenses/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/middleware";

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
): Promise<Response> {
  const user = await getUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await pool.execute("DELETE FROM expenses WHERE id = ? AND user_id = ?", [
      context.params.id,
      user.userId,
    ]);

    return NextResponse.json({ message: "Expense deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
