import type { NextRequest } from "next/server"
import { verifyToken } from "./auth"

export function getUser(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      console.log("No token found in cookies")
      return null
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      console.log("Invalid token")
      return null
    }

    return decoded
  } catch (error) {
    console.error("Error in getUser middleware:", error)
    return null
  }
}
