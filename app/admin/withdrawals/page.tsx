"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SkeletonTable } from "@/components/skeleton-loader"
import { Search } from "lucide-react"

export default function AdminWithdrawalsPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const withdrawals = [
    {
      id: "WD001",
      merchant: "Merchant A",
      type: "INR",
      amount: "₹100,000",
      status: "Approved",
      createdAt: "2024-01-12",
      processedAt: "2024-01-12",
    },
    {
      id: "WD002",
      merchant: "Merchant B",
      type: "USDT",
      amount: "$1,200",
      status: "Pending",
      createdAt: "2024-01-13",
      processedAt: "-",
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">All Withdrawals</h1>
          <p className="text-muted-foreground">View and manage all merchant withdrawals</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Withdrawal List</CardTitle>
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonTable rows={5} cols={7} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">ID</th>
                      <th className="text-left p-3 font-medium">Merchant</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Amount</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Created</th>
                      <th className="text-left p-3 font-medium">Processed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((withdrawal) => (
                      <tr key={withdrawal.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-3">{withdrawal.id}</td>
                        <td className="p-3">{withdrawal.merchant}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {withdrawal.type}
                          </span>
                        </td>
                        <td className="p-3 font-medium">{withdrawal.amount}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              withdrawal.status === "Approved"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }`}
                          >
                            {withdrawal.status}
                          </span>
                        </td>
                        <td className="p-3 text-xs">{withdrawal.createdAt}</td>
                        <td className="p-3 text-xs">{withdrawal.processedAt}</td>
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
