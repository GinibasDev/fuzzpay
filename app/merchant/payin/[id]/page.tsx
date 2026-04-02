"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SkeletonForm } from "@/components/skeleton-loader"
import { ArrowLeft, Copy } from "lucide-react"

export default function PayinDetailPage() {
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [payinDetail, setPayinDetail] = useState<any>(null)

  useEffect(() => {
    if (params.id) {
      fetch(`/api/transactions/${params.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            console.error('Transaction fetch error:', data.error)
          } else {
            setPayinDetail(data)
          }
          setIsLoading(false)
        })
        .catch(err => {
          console.error('Failed to fetch transaction:', err)
          setIsLoading(false)
        })
    }
  }, [params.id])

  const notifications = [
    { time: payinDetail?.createdAt ? new Date(payinDetail.createdAt).toLocaleString() : "N/A", status: "Success", response: "200 OK" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/merchant/payin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Payin Details</h1>
            <p className="text-muted-foreground">View full transaction details</p>
          </div>
        </div>

        {isLoading ? (
          <SkeletonForm />
        ) : !payinDetail ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold">Transaction not found</h2>
            <p className="text-muted-foreground mt-2">We couldn't find the transaction you're looking for.</p>
            <Link href="/merchant/payin" className="mt-4 inline-block">
              <Button>Return to Payin List</Button>
            </Link>
          </div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Transaction Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">ID</label>
                    <p className="text-base font-medium">{payinDetail.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Order Number</label>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-medium">{payinDetail.orderNumber}</p>
                      <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(payinDetail.orderNumber)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Merchant Order Number</label>
                    <p className="text-base font-medium">{payinDetail.merchantOrderNumber || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Order Amount</label>
                    <p className="text-base font-medium">₹{payinDetail.amount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Payment Amount</label>
                    <p className="text-base font-medium text-green-600">₹{payinDetail.paymentAmount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Service Fee</label>
                    <p className="text-base font-medium text-red-600">₹{payinDetail.serviceFee?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <p>
                      <span className={`px-2 py-1 rounded text-xs ${
                        payinDetail.status === "SUCCESS"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : payinDetail.status === "FAILED"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}>
                        {payinDetail.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                    <p className="text-base font-medium">{payinDetail.paymentMethod || 'UPI'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Channel</label>
                    <p className="text-base font-medium">{payinDetail.channelName || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Creation Time</label>
                    <p className="text-base text-muted-foreground">{new Date(payinDetail.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Update Time</label>
                    <p className="text-base text-muted-foreground">{new Date(payinDetail.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Time</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Response</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notifications.map((notif, index) => (
                        <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="p-3">{notif.time}</td>
                          <td className="p-3">{notif.status}</td>
                          <td className="p-3">{notif.response}</td>
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
