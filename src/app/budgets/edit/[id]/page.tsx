"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const defaultCategories = [
  { name: "Bills", amount: "" },
  { name: "Education", amount: "" },
  { name: "Food", amount: "" },
  { name: "Gym", amount: "" },
  { name: "Transportation", amount: "" },
]

interface Budget {
  id: number
  name: string
  monthly_income: number
  start_date: string
  end_date: string
  categories: Array<{
    category_name: string
    allocated_amount: number
  }>
}

export default function EditBudgetPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState({
    name: "",
    monthlyIncome: "",
    startDate: "",
    endDate: "",
  })
  const [categories, setCategories] = useState(defaultCategories)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchBudget()
  }, [])

  const fetchBudget = async () => {
    try {
      const response = await fetch(`/api/budgets/${params.id}`)
      if (response.ok) {
        const budget: Budget = await response.json()

        setFormData({
          name: budget.name,
          monthlyIncome: budget.monthly_income.toString(),
          startDate: budget.start_date.split("T")[0], // Format date for input
          endDate: budget.end_date.split("T")[0],
        })

        // Update categories with existing data
        const updatedCategories = defaultCategories.map((cat) => {
          const existingCategory = budget.categories?.find((bc) => bc.category_name === cat.name)
          return {
            name: cat.name,
            amount: existingCategory ? existingCategory.allocated_amount.toString() : "",
          }
        })
        setCategories(updatedCategories)
      } else {
        setError("Failed to fetch budget details")
      }
    } catch (error) {
      console.error("Error fetching budget:", error)
      setError("Network error while fetching budget")
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (index: number, amount: string) => {
    const updatedCategories = [...categories]
    updatedCategories[index].amount = amount
    setCategories(updatedCategories)
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Budget name is required")
      return false
    }
    if (!formData.monthlyIncome || Number.parseFloat(formData.monthlyIncome) <= 0) {
      setError("Monthly income must be greater than 0")
      return false
    }
    if (!formData.startDate) {
      setError("Start date is required")
      return false
    }
    if (!formData.endDate) {
      setError("End date is required")
      return false
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError("End date must be after start date")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    setSaving(true)

    try {
      // Prepare categories data - only include categories with amounts > 0
      const validCategories = categories
        .filter((cat) => cat.amount && Number.parseFloat(cat.amount) > 0)
        .map((cat) => ({
          name: cat.name,
          amount: Number.parseFloat(cat.amount),
        }))

      const requestData = {
        name: formData.name.trim(),
        monthlyIncome: Number.parseFloat(formData.monthlyIncome),
        startDate: formData.startDate,
        endDate: formData.endDate,
        categories: validCategories,
      }

      const response = await fetch(`/api/budgets/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/budgets")
      } else {
        setError(data.error || "Failed to update budget")
      }
    } catch (error) {
      console.error("Error updating budget:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setSaving(false)
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
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Edit Budget</h1>

          <Card>
            <CardHeader>
              <CardTitle>Budget Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Budget Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Monthly Budget 2024"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="monthlyIncome">Monthly Income * (₹)</Label>
                    <Input
                      id="monthlyIncome"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.monthlyIncome}
                      onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      min={formData.startDate}
                      required
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Budget Categories (Optional)</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Allocate amounts to different categories. Leave blank for categories you don't want to track.
                  </p>
                  <div className="space-y-3">
                    {categories.map((category, index) => (
                      <div key={category.name} className="flex items-center space-x-4">
                        <Label className="w-24 text-sm">{category.name}</Label>
                        <div className="flex-1 relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={category.amount}
                            onChange={(e) => handleCategoryChange(index, e.target.value)}
                            className="pl-8"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/budgets")}
                    className="flex-1"
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600" disabled={saving}>
                    {saving ? "Updating Budget..." : "Update Budget"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <ThemeToggle />
    </div>
  )
}
