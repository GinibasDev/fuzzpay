"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SkeletonTable } from "@/components/skeleton-loader"
import { Search } from "lucide-react"

export default function MerchantNotificationsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [notifications, setNotifications] = useState<any[]>([])
  const [search, setSearch] = useState("")

  const fetchNotifications = async (searchTerm = "") => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`/api/merchant/notifications?${params.toString()}`)
      const data = await response.json()
      setNotifications(data)
    } catch (error) {
      console.error('Fetch notifications error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)
    // Debounce search
    const timeoutId = setTimeout(() => fetchNotifications(value), 500)
    return () => clearTimeout(timeoutId)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Notifications</h1>
          <p className="text-muted-foreground">View callback and notification logs</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Notification Logs</CardTitle>
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by order number..." 
                  className="pl-10" 
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    fetchNotifications(e.target.value)
                  }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonTable rows={5} cols={7} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium whitespace-nowrap">ID</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Type</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Order Number</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Timestamp</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Status</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Retry Count</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Response</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.length > 0 ? notifications.map((notif) => (
                      <tr key={notif.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-3 whitespace-nowrap">{notif.id}</td>
                        <td className="p-3 whitespace-nowrap">{notif.type}</td>
                        <td className="p-3 whitespace-nowrap font-medium">{notif.orderNumber}</td>
                        <td className="p-3 whitespace-nowrap text-muted-foreground">
                          {new Date(notif.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              notif.status === "Success"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : notif.status === "Failed"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }`}
                          >
                            {notif.status}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">{notif.retryCount}</td>
                        <td className="p-3 whitespace-nowrap max-w-[200px] truncate" title={notif.response}>
                          {notif.response}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={7} className="p-3 text-center text-muted-foreground">No notifications found</td>
                      </tr>
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
