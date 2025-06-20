"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, CreditCard, Target } from "lucide-react"
import { formatCurrency, toNumber } from "@/lib/utils"

interface DashboardStats {
  totalExpenses: number
  monthlyExpenses: number
  totalBudgets: number
  activeBudgets: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalExpenses: 0,
    monthlyExpenses: 0,
    totalBudgets: 0,
    activeBudgets: 0,
  })

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const [expensesRes, budgetsRes] = await Promise.all([fetch("/api/expenses"), fetch("/api/budgets")])

        if (expensesRes.ok && budgetsRes.ok) {
          const expenses = await expensesRes.json()
          const budgets = await budgetsRes.json()

          const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + toNumber(expense.amount), 0)
          const currentMonth = new Date().getMonth()
          const currentYear = new Date().getFullYear()

          const monthlyExpenses = expenses
            .filter((expense: any) => {
              const expenseDate = new Date(expense.date)
              return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
            })
            .reduce((sum: number, expense: any) => sum + toNumber(expense.amount), 0)

          setStats({
            totalExpenses,
            monthlyExpenses,
            totalBudgets: budgets.length,
            activeBudgets: budgets.filter((budget: any) => budget.is_active).length,
          })
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Welcome back! Here's an overview of your finances.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalExpenses)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.monthlyExpenses)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budgets</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBudgets}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Budgets</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeBudgets}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="/expenses/add"
                  className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
                >
                  <div className="font-medium">Add Expense</div>
                  <div className="text-sm text-gray-500">Record a new expense</div>
                </a>
                <a
                  href="/budgets/add"
                  className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
                >
                  <div className="font-medium">Create Budget</div>
                  <div className="text-sm text-gray-500">Set up a new budget</div>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">Your recent expenses and budget updates will appear here.</div>
            </CardContent>
          </Card>
        </div>
      </main>

      <ThemeToggle />
    </div>
  )
}
