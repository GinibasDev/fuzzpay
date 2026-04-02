"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SkeletonTable } from "@/components/skeleton-loader"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Search, Download } from "lucide-react"

export default function PayoutPendingPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const pendingPayouts = [
    {
      id: "PO002",
      merchant: "Merchant B",
      orderNumber: "PO12346",
      amount: "₹18,500",
      serviceFee: "₹185",
      status: "Pending Approval",
      recipientName: "Jane Smith",
      bankNumber: "9876543210",
      ifsc: "HDFC0001234",
      creationTime: "2024-01-12 10:30",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Payout Pending Approval</h1>
            <p className="text-muted-foreground">Review and approve pending payout transactions</p>
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
                <Input placeholder="Search by ID, merchant, recipient..." className="pl-9" />
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
                      <th className="text-left p-2 font-medium">Recipient</th>
                      <th className="text-left p-2 font-medium">Bank Number</th>
                      <th className="text-left p-2 font-medium">IFSC</th>
                      <th className="text-left p-2 font-medium">Creation Time</th>
                      <th className="text-left p-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingPayouts.map((payout) => (
                      <tr key={payout.id} className="border-b last:border-0">
                        <td className="p-2">{payout.id}</td>
                        <td className="p-2">{payout.merchant}</td>
                        <td className="p-2">{payout.orderNumber}</td>
                        <td className="p-2 font-medium">{payout.amount}</td>
                        <td className="p-2">{payout.recipientName}</td>
                        <td className="p-2 font-mono text-sm">{payout.bankNumber}</td>
                        <td className="p-2 font-mono text-sm">{payout.ifsc}</td>
                        <td className="p-2 text-sm">{payout.creationTime}</td>
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
