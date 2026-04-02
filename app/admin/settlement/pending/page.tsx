"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SkeletonTable } from "@/components/skeleton-loader"

export default function AdminPendingSettlementPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Pending Settlements</h1>
          <p className="text-muted-foreground">View all pending merchant settlements</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Settlements</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonTable rows={5} cols={6} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">No pending settlements</div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
