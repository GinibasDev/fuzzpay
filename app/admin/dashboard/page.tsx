"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SkeletonStats, SkeletonTable } from "@/components/skeleton-loader"
import { AdminLayout } from "@/components/admin-layout"
import { DollarSign, TrendingUp, ArrowDownToLine, CreditCard, AlertCircle } from "lucide-react"

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(stats => {
        setData(stats)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch stats:', err)
        setIsLoading(false)
      })
  }, [])

  if (isLoading || !data) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Overview of payment operations</p>
          </div>
          <SkeletonStats />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="h-6 w-48 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <SkeletonTable />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="h-6 w-48 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <SkeletonTable />
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const stats = [
    { title: "Total Payin", value: `₹${data.stats.totalPayin.toLocaleString()}`, change: "+0%", icon: TrendingUp },
    { title: "Total Payout", value: `₹${data.stats.totalPayout.toLocaleString()}`, change: "+0%", icon: DollarSign },
    { title: "Total Withdrawals", value: `₹${data.stats.totalWithdrawals.toLocaleString()}`, change: "+0%", icon: ArrowDownToLine },
    { title: "Total Settlements", value: `₹${data.stats.totalSettlements.toLocaleString()}`, change: "+0%", icon: CreditCard },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of payment operations</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-600">{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Merchant Balance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Merchant</th>
                      <th className="text-left p-2 font-medium">INR Balance</th>
                      <th className="text-left p-2 font-medium">USDT Balance</th>
                      <th className="text-left p-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.merchantBalances.map((balance: any, idx: number) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="p-2">{balance.merchant}</td>
                        <td className="p-2 font-medium">₹{balance.inr.toLocaleString()}</td>
                        <td className="p-2 font-medium">${balance.usdt.toLocaleString()}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            balance.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {balance.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                Pending / Failed Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">ID</th>
                      <th className="text-left p-2 font-medium">Type</th>
                      <th className="text-left p-2 font-medium">Merchant</th>
                      <th className="text-left p-2 font-medium">Amount</th>
                      <th className="text-left p-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pendingFailedTxns.map((tx: any) => (
                      <tr key={tx.id} className="border-b last:border-0">
                        <td className="p-2 text-sm text-muted-foreground truncate max-w-[100px]">{tx.id}</td>
                        <td className="p-2 text-sm">{tx.type}</td>
                        <td className="p-2 text-sm">{tx.merchant}</td>
                        <td className="p-2 font-medium text-sm">₹{tx.amount.toLocaleString()}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              tx.status === "FAILED"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
