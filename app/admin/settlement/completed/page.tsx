"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SkeletonTable } from "@/components/skeleton-loader"
import { Search } from "lucide-react"

export default function AdminCompletedSettlementPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const settlements = [
    {
      id: "SET001",
      merchant: "Merchant A",
      amount: "₹500,000",
      transactionCount: "25",
      completedAt: "2024-01-13",
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Completed Settlements</h1>
          <p className="text-muted-foreground">View all completed merchant settlements</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Completed Settlements</CardTitle>
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonTable rows={5} cols={5} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">ID</th>
                      <th className="text-left p-3 font-medium">Merchant</th>
                      <th className="text-left p-3 font-medium">Amount</th>
                      <th className="text-left p-3 font-medium">Transactions</th>
                      <th className="text-left p-3 font-medium">Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settlements.map((settlement) => (
                      <tr key={settlement.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-3">{settlement.id}</td>
                        <td className="p-3">{settlement.merchant}</td>
                        <td className="p-3 font-medium">{settlement.amount}</td>
                        <td className="p-3">{settlement.transactionCount}</td>
                        <td className="p-3 text-xs">{settlement.completedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
