"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SkeletonTable } from "@/components/skeleton-loader"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Search, Download } from "lucide-react"

export default function WithdrawalsPendingPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const pendingWithdrawals = [
    {
      id: "WDP001",
      merchant: "Merchant C",
      orderNumber: "WDP12345",
      amount: "₹75,000",
      type: "INR",
      creationTime: "2024-01-12 12:00",
      status: "Pending Approval",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Pending Withdrawal Approvals</h1>
            <p className="text-muted-foreground">Review and approve pending withdrawals</p>
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
                <Input placeholder="Search by ID, merchant..." className="pl-9" />
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
                      <th className="text-left p-2 font-medium">Type</th>
                      <th className="text-left p-2 font-medium">Amount</th>
                      <th className="text-left p-2 font-medium">Creation Time</th>
                      <th className="text-left p-2 font-medium">Status</th>
                      <th className="text-left p-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingWithdrawals.map((withdrawal) => (
                      <tr key={withdrawal.id} className="border-b last:border-0">
                        <td className="p-2">{withdrawal.id}</td>
                        <td className="p-2">{withdrawal.merchant}</td>
                        <td className="p-2">{withdrawal.orderNumber}</td>
                        <td className="p-2">
                          <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                            {withdrawal.type}
                          </span>
                        </td>
                        <td className="p-2 font-medium">{withdrawal.amount}</td>
                        <td className="p-2 text-sm">{withdrawal.creationTime}</td>
                        <td className="p-2">
                          <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            {withdrawal.status}
                          </span>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button size="sm">Approve</Button>
                            <Button size="sm" variant="outline">
                              Reject
                            </Button>
                          </div>
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
