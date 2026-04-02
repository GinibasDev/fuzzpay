"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SkeletonForm } from "@/components/skeleton-loader"
import { ArrowLeft, Copy } from "lucide-react"

export default function PayoutDetailPage() {
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [payoutDetail, setPayoutDetail] = useState<any>(null)

  useEffect(() => {
    if (params.id) {
      fetch(`/api/transactions/${params.id}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setPayoutDetail(data)
          }
          setIsLoading(false)
        })
        .catch(err => {
          console.error('Failed to fetch payout:', err)
          setIsLoading(false)
        })
    }
  }, [params.id])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/merchant/payout">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Payout Details</h1>
            <p className="text-muted-foreground">View full payout details</p>
          </div>
        </div>

        {isLoading ? (
          <SkeletonForm fields={10} />
        ) : !payoutDetail ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold">Payout not found</h2>
            <p className="text-muted-foreground mt-2">We couldn't find the payout you're looking for.</p>
            <Link href="/merchant/payout" className="mt-4 inline-block">
              <Button>Return to Payout List</Button>
            </Link>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Payout Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID</label>
                  <p className="text-base font-medium">{payoutDetail.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Order Number</label>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-medium">{payoutDetail.orderNumber}</p>
                    <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(payoutDetail.orderNumber)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Merchant Order Number</label>
                  <p className="text-base font-medium">{payoutDetail.merchantOrderNumber || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Order Amount</label>
                  <p className="text-base font-medium font-bold">₹{payoutDetail.amount?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Service Fee</label>
                  <p className="text-base font-medium text-red-600">₹{payoutDetail.serviceFee?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p>
                    <span className={`px-2 py-1 rounded text-xs ${
                      payoutDetail.status === "SUCCESS"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : payoutDetail.status === "FAILED"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}>
                      {payoutDetail.status}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Recipient Name</label>
                  <p className="text-base font-medium">{payoutDetail.recipientName || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account / Card Number</label>
                  <p className="text-base font-medium">{payoutDetail.cardNumber || payoutDetail.paymentCard || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">IFSC Code</label>
                  <p className="text-base font-medium">{payoutDetail.ifsc || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Creation Time</label>
                  <p className="text-base text-muted-foreground">{new Date(payoutDetail.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Update Time</label>
                  <p className="text-base text-muted-foreground">{new Date(payoutDetail.updatedAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Reason for Failure</label>
                  <p className="text-base font-medium text-red-600">{payoutDetail.failureReason || payoutDetail.reasonForFailure || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
