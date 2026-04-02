"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SkeletonStats, SkeletonTable } from "@/components/skeleton-loader"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Wallet, TrendingUp, TrendingDown, Download } from "lucide-react"

export default function WalletUSDTPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [walletData, setWalletData] = useState<{stats: any[], transactions: any[]}>({ stats: [], transactions: [] })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/wallet/usdt')
        const data = await response.json()
        if (data.stats) {
          setWalletData(data)
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const iconMap: { [key: string]: any } = {
    Wallet: Wallet,
    TrendingUp: TrendingUp,
    TrendingDown: TrendingDown,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin USDT Wallet</h1>
            <p className="text-muted-foreground">Manage your USDT wallet balance</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Add Funds</Button>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {isLoading ? (
          <SkeletonStats />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {walletData.stats.map((stat, index) => {
              const Icon = iconMap[stat.icon] || Wallet
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="text-green-600">{stat.change}</span> from last month
                    </p>
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
              <SkeletonTable />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">ID</th>
                      <th className="text-left p-2 font-medium">Type</th>
                      <th className="text-left p-2 font-medium">Amount</th>
                      <th className="text-left p-2 font-medium">Description</th>
                      <th className="text-left p-2 font-medium">TX Hash</th>
                      <th className="text-left p-2 font-medium">Timestamp</th>
                      <th className="text-left p-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {walletData.transactions.map((tx) => (
                      <tr key={tx.id} className="border-b last:border-0">
                        <td className="p-2">{tx.id}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              tx.type === "Debit"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="p-2 font-medium">{tx.amount}</td>
                        <td className="p-2 text-sm">{tx.description}</td>
                        <td className="p-2 font-mono text-xs">{tx.txHash}</td>
                        <td className="p-2 text-sm">{tx.timestamp}</td>
                        <td className="p-2">
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </td>
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
