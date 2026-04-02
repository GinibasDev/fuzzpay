"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SkeletonTable } from "@/components/skeleton-loader"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Search, Download } from "lucide-react"

export default function WithdrawalsUSDTPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const usdtWithdrawals = [
    {
      id: "WDU001",
      merchant: "Merchant B",
      orderNumber: "WDU12345",
      amount: "$1,234.56",
      walletAddress: "TXYz...abcd",
      network: "TRC20",
      networkFee: "$2.50",
      txHash: "0x123...xyz",
      status: "Completed",
      creationTime: "2024-01-12 11:00",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">USDT Withdrawal List</h1>
            <p className="text-muted-foreground">Manage USDT withdrawal transactions</p>
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
                <Input placeholder="Search by ID, merchant, wallet address..." className="pl-9" />
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
                      <th className="text-left p-2 font-medium">Order Number</th>
                      <th className="text-left p-2 font-medium">Amount</th>
                      <th className="text-left p-2 font-medium">Wallet Address</th>
                      <th className="text-left p-2 font-medium">Network</th>
                      <th className="text-left p-2 font-medium">Network Fee</th>
                      <th className="text-left p-2 font-medium">TX Hash</th>
                      <th className="text-left p-2 font-medium">Status</th>
                      <th className="text-left p-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usdtWithdrawals.map((withdrawal) => (
                      <tr key={withdrawal.id} className="border-b last:border-0">
                        <td className="p-2">{withdrawal.id}</td>
                        <td className="p-2">{withdrawal.merchant}</td>
                        <td className="p-2">{withdrawal.orderNumber}</td>
                        <td className="p-2 font-medium">{withdrawal.amount}</td>
                        <td className="p-2 font-mono text-sm">{withdrawal.walletAddress}</td>
                        <td className="p-2">
                          <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {withdrawal.network}
                          </span>
                        </td>
                        <td className="p-2">{withdrawal.networkFee}</td>
                        <td className="p-2 font-mono text-sm">{withdrawal.txHash}</td>
                        <td className="p-2">
                          <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {withdrawal.status}
                          </span>
                        </td>
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
