"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SkeletonCard, SkeletonTable } from "@/components/skeleton-loader"
import { ArrowDownToLine, ArrowUpFromLine, Landmark, Wallet, TrendingUp } from "lucide-react"

export default function MerchantDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/merchant/stats")
        const result = await response.json()
        if (response.ok) {
          setData(result)
        }
      } catch (error) {
        console.error("Failed to fetch merchant stats:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  const iconMap: Record<string, any> = {
    "Total Payin Amount": ArrowDownToLine,
    "Total Payout Amount": ArrowUpFromLine,
    "Total Settlements": Landmark,
    "Total Withdrawals": Wallet,
    "Current Balance": TrendingUp,
  }

  const stats = data?.stats || []
  const recentTransactions = data?.recentTransactions || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Merchant Dashboard</h1>
          <p className="text-muted-foreground">Overview of your payment activities</p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {stats.map((stat: any, index: number) => {
              const Icon = iconMap[stat.title] || TrendingUp
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonTable rows={3} cols={5} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Transaction ID</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Amount</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((txn: any) => (
                      <tr key={txn.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-3">{txn.id}</td>
                        <td className="p-3">{txn.type}</td>
                        <td className="p-3 font-medium">{txn.amount}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              txn.status === "Completed" || txn.status === "Success"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : txn.status === "Failed" || txn.status === "Rejected"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }`}
                          >
                            {txn.status}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">{txn.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
