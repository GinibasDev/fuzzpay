"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SkeletonTable } from "@/components/skeleton-loader"
import { Plus, Search } from "lucide-react"

export default function WithdrawalListPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1200)
  }, [])

  const withdrawals = [
    {
      id: "WD001",
      merchant: "Merchant A",
      orderNumber: "WORD123456",
      withdrawalAmount: "₹25,000",
      createdAt: "2024-01-12 08:00",
      confirmedAt: "2024-01-12 08:30",
      completedAt: "2024-01-12 09:00",
      status: "Completed",
      remark: "Processed successfully",
    },
    {
      id: "WD002",
      merchant: "Merchant B",
      orderNumber: "WORD123457",
      withdrawalAmount: "₹40,000",
      createdAt: "2024-01-12 10:00",
      confirmedAt: "2024-01-12 10:15",
      completedAt: "-",
      status: "Pending",
      remark: "Under review",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Withdrawal Management</h1>
            <p className="text-muted-foreground">Manage all withdrawal requests</p>
          </div>
          <Link href="/withdrawals/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Withdrawal
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Withdrawal List</CardTitle>
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by order number, merchant..." className="pl-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonTable rows={5} cols={9} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium whitespace-nowrap">ID</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Merchant</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Order Number</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Amount</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Created</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Confirmed</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Completed</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Status</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((withdrawal) => (
                      <tr key={withdrawal.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-3 whitespace-nowrap">{withdrawal.id}</td>
                        <td className="p-3 whitespace-nowrap">{withdrawal.merchant}</td>
                        <td className="p-3 whitespace-nowrap">{withdrawal.orderNumber}</td>
                        <td className="p-3 whitespace-nowrap font-medium">{withdrawal.withdrawalAmount}</td>
                        <td className="p-3 whitespace-nowrap text-xs">{withdrawal.createdAt}</td>
                        <td className="p-3 whitespace-nowrap text-xs">{withdrawal.confirmedAt}</td>
                        <td className="p-3 whitespace-nowrap text-xs">{withdrawal.completedAt}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              withdrawal.status === "Completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }`}
                          >
                            {withdrawal.status}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap text-xs">{withdrawal.remark}</td>
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
