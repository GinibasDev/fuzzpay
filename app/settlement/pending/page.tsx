"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SkeletonTable } from "@/components/skeleton-loader"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Search, Download } from "lucide-react"

export default function SettlementPendingPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const pendingSettlements = [
    {
      id: "SET001",
      merchant: "Merchant A",
      orderNumber: "SET12345",
      date: "2024-01-12",
      amountReceived: "₹50,000",
      settlementAmount: "₹49,500",
      settledAmount: "₹0",
      pendingAmount: "₹49,500",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Pending Settlements</h1>
            <p className="text-muted-foreground">Manage pending settlement requests</p>
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
                      <th className="text-left p-2 font-medium">Date</th>
                      <th className="text-left p-2 font-medium">Amount Received</th>
                      <th className="text-left p-2 font-medium">Settlement Amount</th>
                      <th className="text-left p-2 font-medium">Pending Amount</th>
                      <th className="text-left p-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingSettlements.map((settlement) => (
                      <tr key={settlement.id} className="border-b last:border-0">
                        <td className="p-2">{settlement.id}</td>
                        <td className="p-2">{settlement.merchant}</td>
                        <td className="p-2">{settlement.orderNumber}</td>
                        <td className="p-2">{settlement.date}</td>
                        <td className="p-2 font-medium">{settlement.amountReceived}</td>
                        <td className="p-2 font-medium">{settlement.settlementAmount}</td>
                        <td className="p-2 font-medium text-yellow-600">{settlement.pendingAmount}</td>
                        <td className="p-2">
                          <Button size="sm">Process</Button>
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
