"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SkeletonTable } from "@/components/skeleton-loader"
import { Search } from "lucide-react"

export default function AdminSettlementPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [settlements, setSettlements] = useState<any[]>([])

  useEffect(() => {
    const fetchSettlements = async () => {
      try {
        const response = await fetch('/api/settlement')
        const data = await response.json()
        if (Array.isArray(data)) {
          setSettlements(data)
        }
      } catch (error) {
        console.error('Failed to fetch settlements:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettlements()
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">All Settlements</h1>
          <p className="text-muted-foreground">View and manage all merchant settlements</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Settlement List</CardTitle>
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-10" />
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
                      <th className="text-left p-3 font-medium">ID</th>
                      <th className="text-left p-3 font-medium">Merchant</th>
                      <th className="text-left p-3 font-medium">Amount</th>
                      <th className="text-left p-3 font-medium">Transactions</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Created</th>
                      <th className="text-left p-3 font-medium">Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settlements.map((settlement) => (
                      <tr key={settlement.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-3">{settlement.id}</td>
                        <td className="p-3">{settlement.merchant}</td>
                        <td className="p-3 font-medium">₹{settlement.settlementAmount?.toLocaleString()}</td>
                        <td className="p-3">{settlement.transactionCount}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            settlement.status === 'SUCCESS' || settlement.status === 'Completed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {settlement.status}
                          </span>
                        </td>
                        <td className="p-3 text-xs">{settlement.date}</td>
                        <td className="p-3 text-xs">{settlement.completedAt}</td>
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
