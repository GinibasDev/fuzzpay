import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Wallet, TrendingUp, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Payment Management System</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive solution for managing payins, payouts, settlements, and withdrawals
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/login">
              <Button size="lg" className="min-w-[200px]">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="min-w-[200px] bg-transparent">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="bg-primary text-primary-foreground p-3 rounded-lg w-fit mb-2">
                <Wallet className="h-6 w-6" />
              </div>
              <CardTitle>Multi-Currency Support</CardTitle>
              <CardDescription>Handle both INR and USDT withdrawals with ease</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="bg-primary text-primary-foreground p-3 rounded-lg w-fit mb-2">
                <TrendingUp className="h-6 w-6" />
              </div>
              <CardTitle>Real-Time Analytics</CardTitle>
              <CardDescription>Track your payments and settlements in real-time</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="bg-primary text-primary-foreground p-3 rounded-lg w-fit mb-2">
                <Shield className="h-6 w-6" />
              </div>
              <CardTitle>Secure & Reliable</CardTitle>
              <CardDescription>Bank-grade security with 2FA authentication</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}
