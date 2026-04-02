"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SkeletonTable } from "@/components/skeleton-loader"
import { Search } from "lucide-react"

export default function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1200)
  }, [])

  const notifications = [
    {
      id: "NOT001",
      merchant: "Merchant A",
      orderNumber: "ORD123456",
      type: "Payin",
      status: "Sent",
      retryCount: "3",
      lastAttempt: "2024-01-12 10:35",
      doNotNotify: "No",
    },
    {
      id: "NOT002",
      merchant: "Merchant B",
      orderNumber: "ORD123457",
      type: "Payout",
      status: "Failed",
      retryCount: "5",
      lastAttempt: "2024-01-12 11:20",
      doNotNotify: "No",
    },
    {
      id: "NOT003",
      merchant: "Merchant C",
      orderNumber: "ORD123458",
      type: "Withdrawal",
      status: "Pending",
      retryCount: "1",
      lastAttempt: "2024-01-12 12:00",
      doNotNotify: "Yes",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Notification Management</h1>
          <p className="text-muted-foreground">Track all notification logs and callbacks</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Notification Logs</CardTitle>
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by order number, merchant..." className="pl-10" />
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
                      <th className="text-left p-3 font-medium whitespace-nowrap">ID</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Merchant</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Order Number</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Type</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Status</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Retry Count</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Last Attempt</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Do Not Notify</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.map((notification) => (
                      <tr key={notification.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-3 whitespace-nowrap">{notification.id}</td>
                        <td className="p-3 whitespace-nowrap">{notification.merchant}</td>
                        <td className="p-3 whitespace-nowrap">{notification.orderNumber}</td>
                        <td className="p-3 whitespace-nowrap">{notification.type}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              notification.status === "Sent"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : notification.status === "Failed"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }`}
                          >
                            {notification.status}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">{notification.retryCount}</td>
                        <td className="p-3 whitespace-nowrap text-xs">{notification.lastAttempt}</td>
                        <td className="p-3 whitespace-nowrap">{notification.doNotNotify}</td>
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
