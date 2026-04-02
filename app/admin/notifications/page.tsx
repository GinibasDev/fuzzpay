"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SkeletonTable } from "@/components/skeleton-loader"
import { Search } from "lucide-react"

export default function AdminNotificationsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/notifications')
        const data = await response.json()
        setNotifications(data)
      } catch (error) {
        console.error('Error fetching notifications:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Notifications</h1>
          <p className="text-muted-foreground">View all callback notifications and logs</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Notification Logs</CardTitle>
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
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Merchant</th>
                      <th className="text-left p-3 font-medium">Transaction ID</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Attempts</th>
                      <th className="text-left p-3 font-medium">Last Attempt</th>
                      <th className="text-left p-3 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.map((notif) => (
                      <tr key={notif.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-3">{notif.id}</td>
                        <td className="p-3">{notif.type}</td>
                        <td className="p-3">{notif.merchant}</td>
                        <td className="p-3">{notif.transactionId}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              notif.status === "Success"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {notif.status}
                          </span>
                        </td>
                        <td className="p-3">{notif.attempts}</td>
                        <td className="p-3 text-xs">{notif.lastAttempt}</td>
                        <td className="p-3 text-xs">{notif.createdAt}</td>
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
