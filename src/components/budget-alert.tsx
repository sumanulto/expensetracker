"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Info } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface BudgetAlert {
  category_name: string
  allocated_amount: number
  spent_amount: number
  remaining_amount: number
  percentage_used: number
}

export function BudgetAlerts() {
  const [alerts, setAlerts] = useState<BudgetAlert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBudgetAlerts()
  }, [])

  const fetchBudgetAlerts = async () => {
    try {
      const response = await fetch("/api/analytics")
      if (response.ok) {
        const data = await response.json()
        const budgetAlerts = (data.budgetAnalysis || []).map((item: any) => ({
          ...item,
          percentage_used: item.allocated_amount > 0 ? (item.spent_amount / item.allocated_amount) * 100 : 0,
        }))
        setAlerts(budgetAlerts)
      }
    } catch (error) {
      console.error("Error fetching budget alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || alerts.length === 0) {
    return null
  }

  const criticalAlerts = alerts.filter((alert) => alert.percentage_used >= 100)
  const warningAlerts = alerts.filter((alert) => alert.percentage_used >= 80 && alert.percentage_used < 100)

  return (
    <div className="space-y-4">
      {criticalAlerts.map((alert) => (
        <Alert key={alert.category_name} variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{alert.category_name}</strong>: You've exceeded your budget! Spent{" "}
            {formatCurrency(alert.spent_amount)} of {formatCurrency(alert.allocated_amount)} (
            {alert.percentage_used.toFixed(1)}%)
          </AlertDescription>
        </Alert>
      ))}

      {warningAlerts.map((alert) => (
        <Alert key={alert.category_name} className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <Info className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <strong>{alert.category_name}</strong>: Approaching budget limit! Spent {formatCurrency(alert.spent_amount)}{" "}
            of {formatCurrency(alert.allocated_amount)} ({alert.percentage_used.toFixed(1)}%)
          </AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
