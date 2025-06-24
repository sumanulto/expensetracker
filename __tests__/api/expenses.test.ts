import { NextRequest } from "next/server"
import { GET as getExpenses, POST as createExpense } from "@/src/app/api/expenses/route"
import { DELETE as deleteExpense } from "@/src/app/api/expenses/[id]/route"
import { generateToken } from "@/src/lib/auth"
import pool from "@/src/lib/db"
import { getUser } from "@/src/lib/middleware"

// Mocks are now global, so we just need to cast them
const mockExecute = (pool as any).execute as jest.Mock
const mockGetUser = getUser as jest.Mock

describe("Expenses API Endpoints", () => {
  const mockUser = { userId: 1 }
  const mockToken = generateToken(1)

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUser.mockReturnValue(mockUser)
  })

  describe("GET /api/expenses", () => {
    it("should return user expenses", async () => {
      const mockExpenses = [
        {
          id: 1,
          date: "2024-01-15",
          category: "Food",
          amount: 25.5,
          description: "Lunch",
          user_id: 1,
          budget_name: "Monthly Budget",
        },
      ]

      mockExecute.mockResolvedValueOnce([mockExpenses, undefined] as any)

      const request = new NextRequest("http://localhost/api/expenses", {
        method: "GET",
        headers: { Cookie: `token=${mockToken}` },
      })

      const response = await getExpenses(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toEqual(mockExpenses)
      expect(mockExecute).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [mockUser.userId])
    })

    it("should return 401 for unauthorized user", async () => {
      mockGetUser.mockReturnValue(null)

      const request = new NextRequest("http://localhost/api/expenses", {
        method: "GET",
      })

      const response = await getExpenses(request)
      const responseData = await response.json()

      expect(response.status).toBe(401)
      expect(responseData.error).toBe("Unauthorized")
    })
  })

  describe("POST /api/expenses", () => {
    it("should create a new expense", async () => {
      const expenseData = {
        date: "2024-01-15",
        category: "Food",
        amount: 25.5,
        description: "Lunch",
        budgetId: 1,
      }

      // Mock category validation
      mockExecute.mockResolvedValueOnce([[{ id: 1 }], undefined] as any)
      // Mock budget validation
      mockExecute.mockResolvedValueOnce([[{ id: 1 }], undefined] as any)
      // Mock expense insertion
      mockExecute.mockResolvedValueOnce([{ insertId: 1 }, undefined] as any)

      const request = new NextRequest("http://localhost/api/expenses", {
        method: "POST",
        headers: { Cookie: `token=${mockToken}` },
        body: JSON.stringify(expenseData),
      })

      const response = await createExpense(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.message).toBe("Expense added successfully")
      expect(responseData.id).toBe(1)
    })

    it("should return error for missing required fields", async () => {
      const incompleteData = {
        category: "Food",
        // missing date and amount
      }

      const request = new NextRequest("http://localhost/api/expenses", {
        method: "POST",
        headers: { Cookie: `token=${mockToken}` },
        body: JSON.stringify(incompleteData),
      })

      const response = await createExpense(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.error).toBe("Date, category, and amount are required")
    })

    it("should return error for invalid amount", async () => {
      const invalidData = {
        date: "2024-01-15",
        category: "Food",
        amount: -10, // negative amount
        description: "Invalid expense",
      }

      const request = new NextRequest("http://localhost/api/expenses", {
        method: "POST",
        headers: { Cookie: `token=${mockToken}` },
        body: JSON.stringify(invalidData),
      })

      const response = await createExpense(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.error).toBe("Amount must be greater than 0")
    })

    it("should return error for invalid category", async () => {
      const invalidData = {
        date: "2024-01-15",
        category: "InvalidCategory",
        amount: 25.5,
        description: "Test expense",
      }

      // Mock category not found
      mockExecute.mockResolvedValueOnce([[], undefined] as any)

      const request = new NextRequest("http://localhost/api/expenses", {
        method: "POST",
        headers: { Cookie: `token=${mockToken}` },
        body: JSON.stringify(invalidData),
      })

      const response = await createExpense(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.error).toBe("Invalid category")
    })
  })

  describe("DELETE /api/expenses/[id]", () => {
    it("should delete an expense", async () => {
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }, undefined] as any)

      const request = new NextRequest("http://localhost/api/expenses/1", {
        method: "DELETE",
        headers: { Cookie: `token=${mockToken}` },
      })

      const response = await deleteExpense(request, { params: { id: "1" } })
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.message).toBe("Expense deleted successfully")
      expect(mockExecute).toHaveBeenCalledWith("DELETE FROM expenses WHERE id = ? AND user_id = ?", [
        "1",
        mockUser.userId,
      ])
    })

    it("should return 401 for unauthorized user", async () => {
      mockGetUser.mockReturnValue(null)

      const request = new NextRequest("http://localhost/api/expenses/1", {
        method: "DELETE",
      })

      const response = await deleteExpense(request, { params: { id: "1" } })
      const responseData = await response.json()

      expect(response.status).toBe(401)
      expect(responseData.error).toBe("Unauthorized")
    })
  })
})
