"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SkeletonTable } from "@/components/skeleton-loader"
import { Search, Eye } from "lucide-react"

export default function MerchantSettlementPage() {
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
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settlement Management</h1>
          <p className="text-muted-foreground">View all settlements</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Settlement List</CardTitle>
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by order number, date..." className="pl-10" />
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
                      <th className="text-left p-3 font-medium whitespace-nowrap">Order Number</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Date</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Amount Received</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Settlement Amount</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Settled Amount</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Pending Amount</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settlements.map((settlement) => (
                      <tr key={settlement.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-3 whitespace-nowrap">{settlement.id}</td>
                        <td className="p-3 whitespace-nowrap font-medium">{settlement.orderNumber}</td>
                        <td className="p-3 whitespace-nowrap">{settlement.date}</td>
                        <td className="p-3 whitespace-nowrap">{settlement.amountReceived}</td>
                        <td className="p-3 whitespace-nowrap">{settlement.settlementAmount}</td>
                        <td className="p-3 whitespace-nowrap">{settlement.settledAmount}</td>
                        <td className="p-3 whitespace-nowrap">{settlement.pendingAmount}</td>
                        <td className="p-3 whitespace-nowrap">
                          <Link href={`/merchant/settlement/${settlement.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
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
