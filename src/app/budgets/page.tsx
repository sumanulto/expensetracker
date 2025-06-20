"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

interface Budget {
  id: number
  name: string
  monthly_income: number
  start_date: string
  end_date: string
  is_active: boolean
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [selectedBudget, setSelectedBudget] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    try {
      const response = await fetch("/api/budgets")
      if (response.ok) {
        const data = await response.json()
        setBudgets(data)
        // Set the first active budget as selected, or first budget if none active
        const activeBudget = data.find((b: Budget) => b.is_active)
        if (activeBudget) {
          setSelectedBudget(activeBudget.id.toString())
        } else if (data.length > 0) {
          setSelectedBudget(data[0].id.toString())
        }
      } else {
        setMessage({ type: "error", text: "Failed to fetch budgets" })
      }
    } catch (error) {
      console.error("Error fetching budgets:", error)
      setMessage({ type: "error", text: "Network error while fetching budgets" })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectBudget = async () => {
    if (!selectedBudget) {
      setMessage({ type: "error", text: "Please select a budget first" })
      return
    }

    setUpdating(true)
    setMessage(null)

    try {
      console.log(`Activating budget: ${selectedBudget}`)

      const response = await fetch(`/api/budgets/${selectedBudget}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: true }),
      })

      const data = await response.json()
      console.log("Response:", data)

      if (response.ok) {
        // Update local state
        setBudgets((prevBudgets) =>
          prevBudgets.map((budget) => ({
            ...budget,
            is_active: budget.id.toString() === selectedBudget,
          })),
        )
        setMessage({ type: "success", text: "Budget activated successfully!" })
      } else {
        setMessage({ type: "error", text: data.error || "Failed to activate budget" })
      }
    } catch (error) {
      console.error("Error selecting budget:", error)
      setMessage({ type: "error", text: "Network error while activating budget" })
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this budget?")) {
      try {
        const response = await fetch(`/api/budgets/${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          setBudgets(budgets.filter((budget) => budget.id !== id))
          if (selectedBudget === id.toString()) {
            setSelectedBudget("")
          }
          setMessage({ type: "success", text: "Budget deleted successfully" })
        } else {
          const data = await response.json()
          setMessage({ type: "error", text: data.error || "Failed to delete budget" })
        }
      } catch (error) {
        console.error("Error deleting budget:", error)
        setMessage({ type: "error", text: "Network error while deleting budget" })
      }
    }
  }

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">Your Budgets</h1>
        </div>

        {message && (
          <div className="mb-6">
            <Alert variant={message.type === "error" ? "destructive" : "default"}>
              {message.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          </div>
        )}

        {budgets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No budgets found. Create your first budget!</p>
            <Link href="/budgets/add">
              <Button className="bg-green-500 hover:bg-green-600">Add New Budget</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Budget Name</TableHead>
                    <TableHead>Monthly Income</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Select</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Edit</TableHead>
                    <TableHead>Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgets.map((budget) => (
                    <TableRow key={budget.id}>
                      <TableCell className="font-medium">{budget.name}</TableCell>
                      <TableCell>{formatCurrency(budget.monthly_income)}</TableCell>
                      <TableCell>{new Date(budget.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(budget.end_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            budget.is_active
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                          }`}
                        >
                          {budget.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <RadioGroup value={selectedBudget} onValueChange={setSelectedBudget}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={budget.id.toString()} id={`budget-${budget.id}`} />
                          </div>
                        </RadioGroup>
                      </TableCell>
                      <TableCell>
                        <Link href={`/budgets/${budget.id}`}>
                          <Button variant="outline" size="sm" className="bg-blue-500 text-white hover:bg-blue-600">
                            Details
                          </Button>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/budgets/${budget.id}/edit`}>
                          <Button variant="outline" size="sm" className="bg-yellow-500 text-white hover:bg-yellow-600">
                            Edit
                          </Button>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(budget.id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-8 text-center space-x-4">
              <Button
                onClick={handleSelectBudget}
                disabled={!selectedBudget || updating}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
              >
                {updating ? "Activating..." : "Activate Selected Budget"}
              </Button>
              <Link href="/budgets/add">
                <Button className="bg-green-500 hover:bg-green-600">Add New Budget</Button>
              </Link>
            </div>

            {selectedBudget && (
              <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                Selected: {budgets.find((b) => b.id.toString() === selectedBudget)?.name}
              </div>
            )}
          </>
        )}
      </main>

      <ThemeToggle />
    </div>
  )
}
