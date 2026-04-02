"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SkeletonTable } from "@/components/skeleton-loader"
import { Plus, Search } from "lucide-react"

export default function PayoutListPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [payouts, setPayouts] = useState<any[]>([])

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const response = await fetch("/api/transactions?type=PAYOUT")
        const data = await response.json()
        const transactions = Array.isArray(data.transactions) ? data.transactions : (Array.isArray(data) ? data : [])
        setPayouts(transactions.map((tx: any) => ({
          id: tx.id,
          merchant: tx.merchant.name,
          orderNumber: tx.orderNumber,
          merchantOrderNumber: tx.merchantOrderNumber || "-",
          orderAmount: `₹${tx.amount.toLocaleString()}`,
          serviceFee: `₹${tx.serviceFee.toLocaleString()}`,
          status: tx.status.charAt(0).toUpperCase() + tx.status.slice(1).toLowerCase(),
          recipientName: tx.recipientName || "-",
          cardNumber: tx.cardNumber || "-",
          ifsc: tx.ifsc || "-",
          failureReason: tx.failureReason || "-",
          createdAt: new Date(tx.createdAt).toLocaleString(),
          updatedAt: new Date(tx.updatedAt).toLocaleString(),
        })))
      } catch (error) {
        console.error("Failed to fetch payouts:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPayouts()
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Payout Management</h1>
            <p className="text-muted-foreground">Manage all outgoing payments</p>
          </div>
          <Link href="/payout/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Payout
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payout Transactions</CardTitle>
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by order number, recipient..." className="pl-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonTable rows={5} cols={13} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium whitespace-nowrap">ID</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Merchant</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Order Number</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Merchant Order</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Amount</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Service Fee</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Status</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Recipient</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Card Number</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">IFSC</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Failure Reason</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Created</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((payout) => (
                      <tr key={payout.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-3 whitespace-nowrap">{payout.id}</td>
                        <td className="p-3 whitespace-nowrap">{payout.merchant}</td>
                        <td className="p-3 whitespace-nowrap">{payout.orderNumber}</td>
                        <td className="p-3 whitespace-nowrap">{payout.merchantOrderNumber}</td>
                        <td className="p-3 whitespace-nowrap font-medium">{payout.orderAmount}</td>
                        <td className="p-3 whitespace-nowrap">{payout.serviceFee}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              payout.status === "Success"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {payout.status}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">{payout.recipientName}</td>
                        <td className="p-3 whitespace-nowrap">{payout.cardNumber}</td>
                        <td className="p-3 whitespace-nowrap">{payout.ifsc}</td>
                        <td className="p-3 whitespace-nowrap text-xs">{payout.failureReason}</td>
                        <td className="p-3 whitespace-nowrap text-xs">{payout.createdAt}</td>
                        <td className="p-3 whitespace-nowrap text-xs">{payout.updatedAt}</td>
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
