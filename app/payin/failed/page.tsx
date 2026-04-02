"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SkeletonTable } from "@/components/skeleton-loader"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Search, Download } from "lucide-react"

export default function PayinFailedPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const failedPayins = [
    {
      id: "PIN001",
      merchant: "Merchant A",
      orderNumber: "ORD12345",
      merchantOrderNumber: "MO001",
      orderAmount: "₹5,000",
      paymentAmount: "₹5,050",
      serviceFee: "₹50",
      status: "Failed",
      creationTime: "2024-01-12 10:30",
      updateTime: "2024-01-12 10:35",
      callbackStatus: "Failed",
      notificationCount: "3",
      failureReason: "Bank timeout",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Payin Failed List</h1>
            <p className="text-muted-foreground">View and manage failed payin transactions</p>
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
                <Input placeholder="Search by ID, merchant, order number..." className="pl-9" />
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
                      <th className="text-left p-2 font-medium">Service Fee</th>
                      <th className="text-left p-2 font-medium">Status</th>
                      <th className="text-left p-2 font-medium">Failure Reason</th>
                      <th className="text-left p-2 font-medium">Creation Time</th>
                      <th className="text-left p-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {failedPayins.map((payin) => (
                      <tr key={payin.id} className="border-b last:border-0">
                        <td className="p-2">{payin.id}</td>
                        <td className="p-2">{payin.merchant}</td>
                        <td className="p-2">{payin.orderNumber}</td>
                        <td className="p-2 font-medium">{payin.orderAmount}</td>
                        <td className="p-2">{payin.serviceFee}</td>
                        <td className="p-2">
                          <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            {payin.status}
                          </span>
                        </td>
                        <td className="p-2 text-sm text-red-600">{payin.failureReason}</td>
                        <td className="p-2 text-sm">{payin.creationTime}</td>
                        <td className="p-2">
                          <Button size="sm" variant="outline">
                            Retry
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
