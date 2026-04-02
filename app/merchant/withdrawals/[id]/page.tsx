"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SkeletonForm } from "@/components/skeleton-loader"
import { ArrowLeft } from "lucide-react"

export default function WithdrawalDetailPage() {
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const withdrawalDetail = {
    id: params.id,
    orderNumber: "WORD123456",
    withdrawalAmount: "₹25,000",
    creationTime: "2024-01-15 08:00 AM",
    confirmationTime: "2024-01-15 08:30 AM",
    completionTime: "2024-01-15 09:00 AM",
    status: "Completed",
    remark: "Processed successfully",
    approvalHistory: [
      { time: "2024-01-15 08:30 AM", action: "Approved", by: "Admin" },
      { time: "2024-01-15 09:00 AM", action: "Completed", by: "System" },
    ],
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/merchant/withdrawals">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Withdrawal Details</h1>
            <p className="text-muted-foreground">View withdrawal status and history</p>
          </div>
        </div>

        {isLoading ? (
          <SkeletonForm fields={8} />
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">ID</label>
                    <p className="text-base font-medium">{withdrawalDetail.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Order Number</label>
                    <p className="text-base font-medium">{withdrawalDetail.orderNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Withdrawal Amount</label>
                    <p className="text-base font-medium">{withdrawalDetail.withdrawalAmount}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <p>
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {withdrawalDetail.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Creation Time</label>
                    <p className="text-base text-muted-foreground">{withdrawalDetail.creationTime}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Confirmation Time</label>
                    <p className="text-base text-muted-foreground">{withdrawalDetail.confirmationTime}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Completion Time</label>
                    <p className="text-base text-muted-foreground">{withdrawalDetail.completionTime}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Remark</label>
                    <p className="text-base font-medium">{withdrawalDetail.remark}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Approval History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Time</th>
                        <th className="text-left p-3 font-medium">Action</th>
                        <th className="text-left p-3 font-medium">By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawalDetail.approvalHistory.map((history, index) => (
                        <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="p-3">{history.time}</td>
                          <td className="p-3 font-medium">{history.action}</td>
                          <td className="p-3">{history.by}</td>
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
