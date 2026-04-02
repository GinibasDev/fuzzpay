"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SkeletonTable } from "@/components/skeleton-loader"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Search, Download } from "lucide-react"

export default function MerchantBalanceLogsPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const balanceLogs = [
    {
      id: "LOG001",
      merchant: "Merchant A",
      transactionType: "Credit",
      amount: "₹50,000",
      previousBalance: "₹100,000",
      newBalance: "₹150,000",
      description: "Payin settlement",
      timestamp: "2024-01-12 10:30",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Merchant Balance Logs</h1>
            <p className="text-muted-foreground">Track merchant balance changes</p>
          </div>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by merchant, transaction type..." className="pl-9" />
              </div>
              <Button variant="outline">Filter</Button>
            </div>
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
                      <th className="text-left p-2 font-medium">Merchant</th>
                      <th className="text-left p-2 font-medium">Transaction Type</th>
                      <th className="text-left p-2 font-medium">Amount</th>
                      <th className="text-left p-2 font-medium">Previous Balance</th>
                      <th className="text-left p-2 font-medium">New Balance</th>
                      <th className="text-left p-2 font-medium">Description</th>
                      <th className="text-left p-2 font-medium">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {balanceLogs.map((log) => (
                      <tr key={log.id} className="border-b last:border-0">
                        <td className="p-2">{log.id}</td>
                        <td className="p-2">{log.merchant}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              log.transactionType === "Credit"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {log.transactionType}
                          </span>
                        </td>
                        <td className="p-2 font-medium">{log.amount}</td>
                        <td className="p-2">{log.previousBalance}</td>
                        <td className="p-2 font-medium">{log.newBalance}</td>
                        <td className="p-2 text-sm">{log.description}</td>
                        <td className="p-2 text-sm">{log.timestamp}</td>
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
