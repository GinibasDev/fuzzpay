"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SkeletonTable } from "@/components/skeleton-loader"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Search, Download } from "lucide-react"

export default function MerchantFeeHistoryPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const feeHistory = [
    {
      id: "FEE001",
      merchant: "Merchant A",
      changeType: "Payin Fee INR",
      previousRate: "2.5%",
      newRate: "2.0%",
      changedBy: "Admin User",
      timestamp: "2024-01-10 15:00",
      reason: "Volume discount",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Merchant Fee Change History</h1>
            <p className="text-muted-foreground">Track merchant fee configuration changes</p>
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
                <Input placeholder="Search by merchant, change type..." className="pl-9" />
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
                      <th className="text-left p-2 font-medium">Change Type</th>
                      <th className="text-left p-2 font-medium">Previous Rate</th>
                      <th className="text-left p-2 font-medium">New Rate</th>
                      <th className="text-left p-2 font-medium">Changed By</th>
                      <th className="text-left p-2 font-medium">Timestamp</th>
                      <th className="text-left p-2 font-medium">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeHistory.map((fee) => (
                      <tr key={fee.id} className="border-b last:border-0">
                        <td className="p-2">{fee.id}</td>
                        <td className="p-2">{fee.merchant}</td>
                        <td className="p-2">{fee.changeType}</td>
                        <td className="p-2 font-medium text-red-600">{fee.previousRate}</td>
                        <td className="p-2 font-medium text-green-600">{fee.newRate}</td>
                        <td className="p-2">{fee.changedBy}</td>
                        <td className="p-2 text-sm">{fee.timestamp}</td>
                        <td className="p-2 text-sm">{fee.reason}</td>
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
