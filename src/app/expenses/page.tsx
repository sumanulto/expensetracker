"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { BudgetAlerts } from "@/components/budget-alert"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

interface Expense {
  id: number
  date: string
  category: string
  amount: number
  description: string
  budget_name?: string
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await fetch("/api/expenses")
      if (response.ok) {
        const data = await response.json()
        setExpenses(data)
      }
    } catch (error) {
      console.error("Error fetching expenses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        const response = await fetch(`/api/expenses/${id}`, {
          method: "DELETE",
        })
        if (response.ok) {
          setExpenses(expenses.filter((expense) => expense.id !== id))
        }
      } catch (error) {
        console.error("Error deleting expense:", error)
      }
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Food: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Transportation: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Bills: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      Entertainment: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      Education: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Shopping: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      Healthcare: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
      Gym: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    }
    return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">Expenses</h1>

          {/* Budget Alerts */}
          <BudgetAlerts />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No expenses found.{" "}
                    <Link href="/expenses/add" className="text-blue-500 hover:underline">
                      Add your first expense
                    </Link>
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(expense.category)}>{expense.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(expense.amount)}</TableCell>
                    <TableCell>{expense.description || "-"}</TableCell>
                    <TableCell>
                      {expense.budget_name ? (
                        <Badge variant="outline">{expense.budget_name}</Badge>
                      ) : (
                        <span className="text-gray-400">No Budget</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(expense.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-8 text-center">
          <Link href="/expenses/add">
            <Button className="bg-blue-500 hover:bg-blue-600">Add New Expense</Button>
          </Link>
        </div>
      </main>

      <ThemeToggle />
    </div>
  )
}
