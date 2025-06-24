import { NextResponse } from 'next/server';
import db from '@/src/lib/db';
import { verifyPassword, generateToken } from '@/src/lib/auth';
import { RowDataPacket } from 'mysql2';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
        }

        const [rows] = await db.execute<RowDataPacket[]>(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [username, username]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const user = rows[0];
        const passwordMatch = await verifyPassword(password, user.password);

        if (!passwordMatch) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const token = generateToken(user.id);
        const response = NextResponse.json({ message: "Login successful" }, { status: 200 });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });

        return response;

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}