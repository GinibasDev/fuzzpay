"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SkeletonTable } from "@/components/skeleton-loader"
import { Search, Plus } from "lucide-react"

export default function MerchantWithdrawalsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [withdrawals, setWithdrawals] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/merchant/withdrawals')
      .then(res => res.json())
      .then(data => {
        setWithdrawals(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Fetch error:', err)
        setIsLoading(false)
      })
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Withdrawal Management</h1>
            <p className="text-muted-foreground">View all withdrawal requests</p>
          </div>
          <Link href="/merchant/withdrawals/add">
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
                <Input placeholder="Search by amount..." className="pl-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonTable rows={5} cols={6} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium whitespace-nowrap">ID</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Type</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Amount (INR)</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">USDT Amount</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Status</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Creation Time</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-4 text-center text-muted-foreground">No withdrawals found</td>
                      </tr>
                    ) : (
                      withdrawals.map((withdrawal) => (
                        <tr key={withdrawal._id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="p-3 whitespace-nowrap text-xs">{withdrawal._id}</td>
                          <td className="p-3 whitespace-nowrap font-medium uppercase">{withdrawal.type}</td>
                          <td className="p-3 whitespace-nowrap font-medium">₹{withdrawal.amountINR.toLocaleString()}</td>
                          <td className="p-3 whitespace-nowrap">{withdrawal.usdtAmount ? `${withdrawal.usdtAmount.toFixed(2)} USDT` : '-'}</td>
                          <td className="p-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                withdrawal.status === "COMPLETED"
                                  ? "bg-green-100 text-green-800"
                                  : withdrawal.status === "REJECTED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {withdrawal.status}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap text-muted-foreground">{new Date(withdrawal.createdAt).toLocaleString()}</td>
                          <td className="p-3 whitespace-nowrap">{withdrawal.remark || '-'}</td>
                        </tr>
                      ))
                    )}
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
