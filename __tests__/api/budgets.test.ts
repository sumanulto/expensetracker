import { NextRequest } from "next/server"
import { GET as getBudgets, POST as createBudget } from "@/src/app/api/budgets/route"
import { GET as getBudget, PATCH as patchBudget, DELETE as deleteBudget } from "@/src/app/api/budgets/[id]/route"
import { generateToken } from "@/src/lib/auth"
import pool from "@/src/lib/db"
import { getUser } from "@/src/lib/middleware"

// Mocks are now global, so we just need to cast them
const mockExecute = (pool as any).execute as jest.Mock
const mockGetConnection = (pool as any).getConnection as jest.Mock
const mockGetUser = getUser as jest.Mock

describe("Budgets API Endpoints", () => {
  const mockUser = { userId: 1 }
  const mockToken = generateToken(1)

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUser.mockReturnValue(mockUser)
  })

  describe("GET /api/budgets", () => {
    it("should return user budgets", async () => {
      const mockBudgets = [
        {
          id: 1,
          name: "Monthly Budget",
          monthly_income: 5000,
          start_date: "2024-01-01",
          end_date: "2024-12-31",
          is_active: true,
        },
      ]

      mockExecute.mockResolvedValueOnce([mockBudgets, undefined] as any)

      const request = new NextRequest("http://localhost/api/budgets", {
        method: "GET",
        headers: { Cookie: `token=${mockToken}` },
      })

      const response = await getBudgets(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toEqual(mockBudgets)
    })

    it("should return 401 for unauthorized user", async () => {
      mockGetUser.mockReturnValue(null)

      const request = new NextRequest("http://localhost/api/budgets", {
        method: "GET",
      })

      const response = await getBudgets(request)
      const responseData = await response.json()

      expect(response.status).toBe(401)
      expect(responseData.error).toBe("Unauthorized")
    })
  })

  describe("POST /api/budgets", () => {
    it("should create a new budget", async () => {
      const budgetData = {
        name: "Test Budget",
        monthlyIncome: 5000,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        categories: [
          { name: "Food", amount: 1000 },
          { name: "Transportation", amount: 500 },
        ],
      }

      // Mock database connection and transaction
      const mockConnection = {
        beginTransaction: jest.fn(),
        execute: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
        release: jest.fn(),
      }

      mockGetConnection.mockResolvedValueOnce(mockConnection as any)
      mockConnection.execute
        .mockResolvedValueOnce([{ insertId: 1 }, undefined] as any) // Budget insertion
        .mockResolvedValueOnce([[{ id: 1 }], undefined] as any) // Category validation
        .mockResolvedValueOnce([{}, undefined] as any) // Category insertion
        .mockResolvedValueOnce([[{ id: 2 }], undefined] as any) // Category validation
        .mockResolvedValueOnce([{}, undefined] as any) // Category insertion

      const request = new NextRequest("http://localhost/api/budgets", {
        method: "POST",
        headers: { Cookie: `token=${mockToken}` },
        body: JSON.stringify(budgetData),
      })

      const response = await createBudget(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.message).toBe("Budget created successfully")
      expect(responseData.id).toBe(1)
      expect(mockConnection.beginTransaction).toHaveBeenCalled()
      expect(mockConnection.commit).toHaveBeenCalled()
    })

    it("should return error for missing required fields", async () => {
      const incompleteData = {
        name: "Test Budget",
        // missing other required fields
      }

      const request = new NextRequest("http://localhost/api/budgets", {
        method: "POST",
        headers: { Cookie: `token=${mockToken}` },
        body: JSON.stringify(incompleteData),
      })

      const response = await createBudget(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.error).toBe("All fields are required")
    })

    it("should return error for invalid monthly income", async () => {
      const invalidData = {
        name: "Test Budget",
        monthlyIncome: -1000, // negative income
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        categories: [],
      }

      const request = new NextRequest("http://localhost/api/budgets", {
        method: "POST",
        headers: { Cookie: `token=${mockToken}` },
        body: JSON.stringify(invalidData),
      })

      const response = await createBudget(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.error).toBe("Monthly income must be greater than 0")
    })

    it("should return error for invalid date range", async () => {
      const invalidData = {
        name: "Test Budget",
        monthlyIncome: 5000,
        startDate: "2024-12-31",
        endDate: "2024-01-01", // end date before start date
        categories: [],
      }

      const request = new NextRequest("http://localhost/api/budgets", {
        method: "POST",
        headers: { Cookie: `token=${mockToken}` },
        body: JSON.stringify(invalidData),
      })

      const response = await createBudget(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.error).toBe("End date must be after start date")
    })
  })

  describe("GET /api/budgets/[id]", () => {
    it("should return budget details", async () => {
      const mockBudget = {
        id: 1,
        name: "Test Budget",
        monthly_income: 5000,
        start_date: "2024-01-01",
        end_date: "2024-12-31",
        is_active: true,
      }

      const mockCategories = [{ id: 1, category_name: "Food", allocated_amount: 1000 }]

      const mockExpenses = [{ category: "Food", spent: 500 }]

      mockExecute
        .mockResolvedValueOnce([[mockBudget], undefined] as any)
        .mockResolvedValueOnce([mockCategories, undefined] as any)
        .mockResolvedValueOnce([mockExpenses, undefined] as any)

      const request = new NextRequest("http://localhost/api/budgets/1", {
        method: "GET",
        headers: { Cookie: `token=${mockToken}` },
      })

      const response = await getBudget(request, { params: { id: "1" } })
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.id).toBe(1)
      expect(responseData.categories).toEqual(mockCategories)
      expect(responseData.expenses).toEqual(mockExpenses)
    })

    it("should return 404 for non-existent budget", async () => {
      mockExecute.mockResolvedValueOnce([[], undefined] as any)

      const request = new NextRequest("http://localhost/api/budgets/999", {
        method: "GET",
        headers: { Cookie: `token=${mockToken}` },
      })

      const response = await getBudget(request, { params: { id: "999" } })
      const responseData = await response.json()

      expect(response.status).toBe(404)
      expect(responseData.error).toBe("Budget not found")
    })
  })

  describe("PATCH /api/budgets/[id]", () => {
    it("should activate a budget", async () => {
      // Mock database connection and transaction
      const mockConnection = {
        beginTransaction: jest.fn(),
        execute: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
        release: jest.fn(),
      }

      mockGetConnection.mockResolvedValueOnce(mockConnection as any)
      mockConnection.execute
        .mockResolvedValueOnce([{}, undefined] as any) // Deactivate other budgets
        .mockResolvedValueOnce([{ affectedRows: 1 }, undefined] as any) // Activate selected budget

      const request = new NextRequest("http://localhost/api/budgets/1", {
        method: "PATCH",
        headers: { Cookie: `token=${mockToken}` },
        body: JSON.stringify({ is_active: true }),
      })

      const response = await patchBudget(request, { params: { id: "1" } })
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.message).toBe("Budget updated successfully")
      expect(mockConnection.beginTransaction).toHaveBeenCalled()
      expect(mockConnection.commit).toHaveBeenCalled()
    })
  })

  describe("DELETE /api/budgets/[id]", () => {
    it("should delete a budget", async () => {
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }, undefined] as any)

      const request = new NextRequest("http://localhost/api/budgets/1", {
        method: "DELETE",
        headers: { Cookie: `token=${mockToken}` },
      })

      const response = await deleteBudget(request, { params: { id: "1" } })
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.message).toBe("Budget deleted successfully")
    })

    it("should return 404 for non-existent budget", async () => {
      mockExecute.mockResolvedValueOnce([{ affectedRows: 0 }, undefined] as any)

      const request = new NextRequest("http://localhost/api/budgets/999", {
        method: "DELETE",
        headers: { Cookie: `token=${mockToken}` },
      })

      const response = await deleteBudget(request, { params: { id: "999" } })
      const responseData = await response.json()

      expect(response.status).toBe(404)
      expect(responseData.error).toBe("Budget not found or not authorized")
    })
  })
})