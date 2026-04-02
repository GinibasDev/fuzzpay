"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SkeletonTable } from "@/components/skeleton-loader"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Search, Download } from "lucide-react"

export default function CallbackLogsPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const callbackLogs = [
    {
      id: "CB001",
      merchant: "Merchant A",
      orderNumber: "ORD12345",
      callbackUrl: "https://merchant-a.com/callback",
      requestPayload: '{"order_id":"ORD12345","status":"success"}',
      responseCode: "200",
      responseBody: '{"received":true}',
      status: "Success",
      timestamp: "2024-01-12 10:30",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Callback Logs</h1>
            <p className="text-muted-foreground">Monitor callback requests sent to merchants</p>
          </div>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by merchant, order number..." className="pl-9" />
              </div>
              <Button variant="outline">Filter</Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonTable />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">ID</th>
                      <th className="text-left p-2 font-medium">Merchant</th>
                      <th className="text-left p-2 font-medium">Order Number</th>
                      <th className="text-left p-2 font-medium">Callback URL</th>
                      <th className="text-left p-2 font-medium">Response Code</th>
                      <th className="text-left p-2 font-medium">Status</th>
                      <th className="text-left p-2 font-medium">Timestamp</th>
                      <th className="text-left p-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {callbackLogs.map((log) => (
                      <tr key={log.id} className="border-b last:border-0">
                        <td className="p-2">{log.id}</td>
                        <td className="p-2">{log.merchant}</td>
                        <td className="p-2">{log.orderNumber}</td>
                        <td className="p-2 text-sm truncate max-w-xs">{log.callbackUrl}</td>
                        <td className="p-2">
                          <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {log.responseCode}
                          </span>
                        </td>
                        <td className="p-2">
                          <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {log.status}
                          </span>
                        </td>
                        <td className="p-2 text-sm">{log.timestamp}</td>
                        <td className="p-2">
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </td>
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
