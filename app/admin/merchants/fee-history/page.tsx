"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SkeletonTable } from "@/components/skeleton-loader"
import { Search } from "lucide-react"

export default function AdminMerchantFeeHistoryPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [fees, setFees] = useState<any[]>([])

  useEffect(() => {
    fetchFees()
  }, [])

  const fetchFees = async () => {
    try {
      const response = await fetch('/api/admin/merchants/fee-history')
      if (response.ok) {
        const data = await response.json()
        setFees(data)
      }
    } catch (error) {
      console.error('Fetch fees error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Merchant Fee History</h1>
          <p className="text-muted-foreground">View all merchant fee transactions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Fee History</CardTitle>
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonTable rows={5} cols={8} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">ID</th>
                      <th className="text-left p-3 font-medium">Merchant</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Transaction ID</th>
                      <th className="text-left p-3 font-medium">Amount</th>
                      <th className="text-left p-3 font-medium">Fee Rate</th>
                      <th className="text-left p-3 font-medium">Fee Amount</th>
                      <th className="text-left p-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fees.map((fee) => (
                      <tr key={fee.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-3">{fee.id}</td>
                        <td className="p-3">{fee.merchant}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              fee.transactionType === "PAYIN"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            }`}
                          >
                            {fee.transactionType}
                          </span>
                        </td>
                        <td className="p-3">{fee.transactionId}</td>
                        <td className="p-3">₹{fee.amount?.toLocaleString()}</td>
                        <td className="p-3">{fee.feeRate}%</td>
                        <td className="p-3 font-medium">₹{fee.feeAmount?.toLocaleString()}</td>
                        <td className="p-3 text-xs">{new Date(fee.createdAt).toLocaleString()}</td>
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
