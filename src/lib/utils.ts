import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to safely format currency
export function formatCurrency(amount: string | number | null | undefined): string {
  const numAmount = Number(amount || 0)
  return `₹${numAmount.toFixed(2)}`
}

// Utility function to safely convert to number
export function toNumber(value: string | number | null | undefined): number {
  return Number(value || 0)
}

// Utility function to format percentage
export function formatPercentage(value: string | number | null | undefined): string {
  const numValue = Number(value || 0)
  return `${numValue.toFixed(1)}%`
}
