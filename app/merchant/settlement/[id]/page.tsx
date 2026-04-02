"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SkeletonForm } from "@/components/skeleton-loader"
import { ArrowLeft } from "lucide-react"

export default function SettlementDetailPage() {
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const settlementDetail = {
    id: params.id,
    orderNumber: "SORD123456",
    date: "2024-01-15",
    amountReceived: "₹10,000",
    settlementAmount: "₹9,800",
    settledAmount: "₹9,800",
    pendingAmount: "₹0",
    fee: "₹200",
    transactions: [
      { txnId: "TXN001", amount: "₹5,000", date: "2024-01-15" },
      { txnId: "TXN002", amount: "₹5,000", date: "2024-01-15" },
    ],
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/merchant/settlement">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Settlement Details</h1>
            <p className="text-muted-foreground">View settlement breakdown</p>
          </div>
        </div>

        {isLoading ? (
          <SkeletonForm fields={8} />
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Settlement Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">ID</label>
                    <p className="text-base font-medium">{settlementDetail.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Order Number</label>
                    <p className="text-base font-medium">{settlementDetail.orderNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date</label>
                    <p className="text-base font-medium">{settlementDetail.date}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Amount Received</label>
                    <p className="text-base font-medium">{settlementDetail.amountReceived}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Settlement Amount</label>
                    <p className="text-base font-medium">{settlementDetail.settlementAmount}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Settled Amount</label>
                    <p className="text-base font-medium">{settlementDetail.settledAmount}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Pending Amount</label>
                    <p className="text-base font-medium">{settlementDetail.pendingAmount}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Fee</label>
                    <p className="text-base font-medium">{settlementDetail.fee}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Mapping</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Transaction ID</th>
                        <th className="text-left p-3 font-medium">Amount</th>
                        <th className="text-left p-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settlementDetail.transactions.map((txn, index) => (
                        <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="p-3">{txn.txnId}</td>
                          <td className="p-3 font-medium">{txn.amount}</td>
                          <td className="p-3 text-muted-foreground">{txn.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
