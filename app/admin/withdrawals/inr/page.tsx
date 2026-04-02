"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SkeletonTable } from "@/components/skeleton-loader"

export default function AdminINRWithdrawalsPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const withdrawals = [
    {
      id: "WD001",
      merchant: "Merchant A",
      amount: "₹100,000",
      bankName: "HDFC Bank",
      accountNumber: "****1234",
      status: "Approved",
      createdAt: "2024-01-12",
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">INR Withdrawals</h1>
          <p className="text-muted-foreground">View all INR withdrawal requests</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>INR Withdrawals</CardTitle>
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
                      <th className="text-left p-3 font-medium">Amount</th>
                      <th className="text-left p-3 font-medium">Bank</th>
                      <th className="text-left p-3 font-medium">Account</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((withdrawal) => (
                      <tr key={withdrawal.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-3">{withdrawal.id}</td>
                        <td className="p-3">{withdrawal.merchant}</td>
                        <td className="p-3 font-medium">{withdrawal.amount}</td>
                        <td className="p-3">{withdrawal.bankName}</td>
                        <td className="p-3">{withdrawal.accountNumber}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {withdrawal.status}
                          </span>
                        </td>
                        <td className="p-3 text-xs">{withdrawal.createdAt}</td>
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
