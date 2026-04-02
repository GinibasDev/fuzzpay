"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SkeletonCard } from "@/components/skeleton-loader"
import { Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminINRWalletPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [walletData, setWalletData] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/wallet/inr')
        const data = await response.json()
        setWalletData(data)
      } catch (error) {
        console.error('Error fetching wallet data:', error)
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
          <h1 className="text-3xl font-bold mb-2">INR Wallet</h1>
          <p className="text-muted-foreground">View and manage INR wallet balance</p>
        </div>

        {isLoading || !walletData ? (
          <div className="grid gap-6 md:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {walletData.stats.map((stat: any, index: number) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Wallet className={cn("h-4 w-4", index === 1 ? "text-green-600" : index === 2 ? "text-red-600" : "text-muted-foreground")} />
                </CardHeader>
                <CardContent>
                  <div className={cn("text-2xl font-bold", index === 1 ? "text-green-600" : index === 2 ? "text-red-600" : "")}>{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">Available funds</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
