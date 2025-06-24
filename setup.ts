// Global test setup
import { jest } from "@jest/globals"

// Mock Next.js modules
jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
      ...options,
    })),
  },
}))

// Mock environment variables
process.env.JWT_SECRET = "okay"
process.env.DB_HOST = "localhost"
process.env.DB_USER = "root"
process.env.DB_PASSWORD = ""
process.env.DB_NAME = "expense_tracker"

// Global test timeout
jest.setTimeout(10000)
