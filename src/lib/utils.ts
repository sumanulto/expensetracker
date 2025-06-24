// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to safely format currency
export function formatCurrency(amount: string | number | null | undefined): string {
  const numAmount = Number(amount); // Convert directly to number
  // If the result is NaN (e.g., from "invalid", undefined), return "₹0.00"
  if (isNaN(numAmount)) {
    return "₹0.00";
  }
  return `₹${numAmount.toFixed(2)}`;
}

// Utility function to safely convert to number
export function toNumber(value: string | number | null | undefined): number {
  const num = Number(value); // Convert directly to number
  // If the result is NaN, return 0 as per your test expectation.
  return isNaN(num) ? 0 : num;
}

// Utility function to format percentage
export function formatPercentage(value: string | number | null | undefined): string {
  const numValue = Number(value); // Convert directly to number
  // If the result is NaN, return "0.0%"
  if (isNaN(numValue)) {
    return "0.0%";
  }
  return `${numValue.toFixed(1)}%`;
}