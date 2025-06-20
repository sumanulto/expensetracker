import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, TrendingUp, Smartphone } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-red-400 text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center">Expense Tracker</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Track Your Expenses Like Never Before
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Take control of your finances with our powerful Expense Tracker application.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-red-400 hover:bg-red-500 text-white px-8 py-3 rounded-full text-lg">
              Sign Up Now
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Manage Your Budget</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Easily create and customize budgets to stay on top of your spending.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analyze Your Expenses</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Visualize your expenses with interactive charts and insightful reports.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Access Anywhere</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track your expenses on the go with our mobile-friendly app.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <ThemeToggle />
    </div>
  )
}
