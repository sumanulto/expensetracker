"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/expenses", label: "Manage Expenses" },
    { href: "/budgets", label: "Manage Budgets" },
    { href: "/analytics", label: "Reports and Analytics" },
    { href: "/insights", label: "Insights" },
  ]

  return (
    <header className="bg-cyan-700 text-white px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="text-xl font-bold">
            Expense Tracker
          </Link>
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`hover:text-red-100 transition-colors ${pathname === item.href ? "font-semibold" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="bg-transparent border-white text-white hover:bg-white hover:text-red-400"
        >
          Logout
        </Button>
      </div>
    </header>
  )
}
