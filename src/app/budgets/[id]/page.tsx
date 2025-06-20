"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, toNumber } from "@/lib/utils"

interface BudgetDetails {
  id: number
  name: string
  monthly_income: number
  start_date: string
  end_date: string
  categories: Array<{
    category_name: string
    allocated_amount: number
  }>
  expenses: Array<{
    category: string
    spent: number
  }>
}

export default function BudgetDetailsPage({ params }: { params: { id: string } }) {
  const [budget, setBudget] = useState<BudgetDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBudgetDetails()
  }, [])

  const fetchBudgetDetails = async () => {
    try {
      const response = await fetch(`/api/budgets/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setBudget(data)
      }
    } catch (error) {
      console.error("Error fetching budget details:", error)
    } finally {
      setLoading(false)
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

  if (!budget) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Budget not found</div>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">Budget Details</h1>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-500">Monthly Income:</div>
                <div className="text-xl font-bold">{formatCurrency(budget.monthly_income)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Start Date:</div>
                <div className="text-xl font-bold">{new Date(budget.start_date).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">End Date:</div>
                <div className="text-xl font-bold">{new Date(budget.end_date).toLocaleDateString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Budget Categories</h2>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Allocated Amount</TableHead>
                <TableHead>Spent Amount</TableHead>
                <TableHead>Remaining Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budget.categories.map((category) => {
                const spent = toNumber(budget.expenses.find((e: any) => e.category === category.category_name)?.spent)
                const remaining = toNumber(category.allocated_amount) - spent

                return (
                  <TableRow key={category.category_name}>
                    <TableCell>{category.category_name}</TableCell>
                    <TableCell>{formatCurrency(category.allocated_amount)}</TableCell>
                    <TableCell>{formatCurrency(spent)}</TableCell>
                    <TableCell className={remaining < 0 ? "text-red-500" : "text-green-500"}>
                      {formatCurrency(remaining)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </main>

      <ThemeToggle />
    </div>
  )
}
