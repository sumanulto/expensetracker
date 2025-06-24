import { NextRequest, NextResponse } from "next/server";
import db from "@/src/lib/db";
import { generateToken, hashPassword } from "@/src/lib/auth";
import { OkPacket, RowDataPacket } from "mysql2";

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const [result] = await db.execute<OkPacket & RowDataPacket[]>(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    const token = generateToken(result.insertId);

    const response = NextResponse.json(
      {
        message: "User registered successfully",
        user: { id: result.insertId, username, email },
      },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    // Check for duplicate entry error
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 409 } // Use 409 Conflict for this error
      );
    }

    // Log other errors for debugging
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}