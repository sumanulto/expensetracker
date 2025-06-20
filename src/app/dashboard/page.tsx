"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DollarSign, TrendingUp, CreditCard, Target, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { formatCurrency, toNumber } from "@/lib/utils"

interface DashboardStats {
  totalExpenses: number
  monthlyExpenses: number
  totalBudgets: number
  activeBudgets: number
}

interface RecentExpense {
  id: number
  date: string
  category: string
  amount: number
  description: string
  created_at: string
}

interface BudgetAlert {
  category_name: string
  allocated_amount: number
  spent_amount: number
  remaining_amount: number
  percentage_used: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalExpenses: 0,
    monthlyExpenses: 0,
    totalBudgets: 0,
    activeBudgets: 0,
  })
  const [recentExpenses, setRecentExpenses] = useState<RecentExpense[]>([])
  const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [expensesRes, budgetsRes, analyticsRes] = await Promise.all([
        fetch("/api/expenses"),
        fetch("/api/budgets"),
        fetch("/api/analytics"),
      ])

      if (expensesRes.ok && budgetsRes.ok && analyticsRes.ok) {
        const expenses = await expensesRes.json()
        const budgets = await budgetsRes.json()
        const analytics = await analyticsRes.json()

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

        // Set recent expenses
        setRecentExpenses(analytics.recentExpenses || [])

        // Calculate budget alerts
        const alerts = (analytics.budgetAnalysis || []).map((item: any) => ({
          ...item,
          percentage_used: item.allocated_amount > 0 ? (item.spent_amount / item.allocated_amount) * 100 : 0,
        }))
        setBudgetAlerts(alerts)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getBudgetAlertLevel = (percentage: number) => {
    if (percentage >= 100) return "danger"
    if (percentage >= 80) return "warning"
    return "safe"
  }

  const getBudgetAlertIcon = (level: string) => {
    switch (level) {
      case "danger":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
        <ThemeToggle />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Welcome back! Here's an overview of your finances.</p>
        </div>

        {/* Budget Alerts */}
        {budgetAlerts.length > 0 && (
          <div className="mb-8 space-y-4">
            {budgetAlerts
              .filter((alert) => alert.percentage_used >= 80)
              .map((alert) => {
                const level = getBudgetAlertLevel(alert.percentage_used)
                return (
                  <Alert
                    key={alert.category_name}
                    variant={level === "danger" ? "destructive" : "default"}
                    className={level === "warning" ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950" : ""}
                  >
                    {getBudgetAlertIcon(level)}
                    <AlertDescription className=" dark:text-amber-300">
                      <strong>{alert.category_name}</strong>: You've spent {formatCurrency(alert.spent_amount)} of{" "}
                      {formatCurrency(alert.allocated_amount)} ({alert.percentage_used.toFixed(1)}%)
                      {level === "danger" && " - Over budget!"}
                      {level === "warning" && " - Approaching budget limit!"}
                    </AlertDescription>
                  </Alert>
                )
              })}
          </div>
        )}

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
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentExpenses.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">
                  No recent expenses.{" "}
                  <a href="/expenses/add" className="text-blue-500 hover:underline">
                    Add your first expense
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentExpenses.slice(0, 5).map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{expense.description || expense.category}</div>
                        <div className="text-xs text-gray-500">
                          {expense.category} • {new Date(expense.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-sm font-medium">{formatCurrency(expense.amount)}</div>
                    </div>
                  ))}
                  {recentExpenses.length > 5 && (
                    <div className="text-center">
                      <a href="/expenses" className="text-sm text-blue-500 hover:underline">
                        View all expenses
                      </a>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Budget Overview */}
        {budgetAlerts.length > 0 && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgetAlerts.map((alert) => {
                    const level = getBudgetAlertLevel(alert.percentage_used)
                    return (
                      <div key={alert.category_name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{alert.category_name}</span>
                          <span className="text-sm text-gray-500">
                            {formatCurrency(alert.spent_amount)} / {formatCurrency(alert.allocated_amount)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              level === "danger" ? "bg-red-500" : level === "warning" ? "bg-yellow-500" : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min(alert.percentage_used, 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{alert.percentage_used.toFixed(1)}% used</span>
                          <span>
                            {alert.remaining_amount >= 0
                              ? `${formatCurrency(alert.remaining_amount)} remaining`
                              : `${formatCurrency(Math.abs(alert.remaining_amount))} over budget`}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <ThemeToggle />
    </div>
  )
}
