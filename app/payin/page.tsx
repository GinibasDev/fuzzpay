"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SkeletonTable } from "@/components/skeleton-loader"
import { Plus, Search } from "lucide-react"

export default function PayinListPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [payins, setPayins] = useState<any[]>([])

  useEffect(() => {
    const fetchPayins = async () => {
      try {
        const response = await fetch("/api/transactions?type=PAYIN")
        const data = await response.json()
        const transactions = Array.isArray(data.transactions) ? data.transactions : (Array.isArray(data) ? data : [])
        setPayins(transactions.map((tx: any) => ({
          id: tx.id,
          merchant: tx.merchant.name,
          orderNumber: tx.orderNumber,
          merchantOrderNumber: tx.merchantOrderNumber || "-",
          orderAmount: `₹${tx.amount.toLocaleString()}`,
          paymentAmount: `₹${(tx.paymentAmount || 0).toLocaleString()}`,
          serviceFee: `₹${tx.serviceFee.toLocaleString()}`,
          status: tx.status.charAt(0).toUpperCase() + tx.status.slice(1).toLowerCase(),
          createdAt: new Date(tx.createdAt).toLocaleString(),
          updatedAt: new Date(tx.updatedAt).toLocaleString(),
          doNotNotify: tx.doNotNotify ? "Yes" : "No",
          notificationCount: tx.notificationCount.toString(),
        })))
      } catch (error) {
        console.error("Failed to fetch payins:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPayins()
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Payin Management</h1>
            <p className="text-muted-foreground">Manage all incoming payments</p>
          </div>
          <Link href="/payin/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Payin
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payin Transactions</CardTitle>
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by order number, merchant..." className="pl-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonTable rows={5} cols={12} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium whitespace-nowrap">ID</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Merchant</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Order Number</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Merchant Order</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Order Amount</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Payment Amount</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Service Fee</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Status</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Created</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Updated</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Do Not Notify</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Notifications</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payins.map((payin) => (
                      <tr key={payin.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-3 whitespace-nowrap">{payin.id}</td>
                        <td className="p-3 whitespace-nowrap">{payin.merchant}</td>
                        <td className="p-3 whitespace-nowrap">{payin.orderNumber}</td>
                        <td className="p-3 whitespace-nowrap">{payin.merchantOrderNumber}</td>
                        <td className="p-3 whitespace-nowrap font-medium">{payin.orderAmount}</td>
                        <td className="p-3 whitespace-nowrap font-medium">{payin.paymentAmount}</td>
                        <td className="p-3 whitespace-nowrap">{payin.serviceFee}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              payin.status === "Success"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }`}
                          >
                            {payin.status}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap text-xs">{payin.createdAt}</td>
                        <td className="p-3 whitespace-nowrap text-xs">{payin.updatedAt}</td>
                        <td className="p-3 whitespace-nowrap">{payin.doNotNotify}</td>
                        <td className="p-3 whitespace-nowrap">{payin.notificationCount}</td>
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
