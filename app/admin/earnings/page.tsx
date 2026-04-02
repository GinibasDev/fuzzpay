"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SkeletonStats } from "@/components/skeleton-loader"
import { AdminLayout } from "@/components/admin-layout"
import { DollarSign, TrendingUp, ArrowDownToLine, ArrowUpFromLine, Calendar } from "lucide-react"

export default function EarningsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/admin/earnings')
      .then(res => res.json())
      .then(stats => {
        setData(stats)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch earnings:', err)
        setIsLoading(false)
      })
  }, [])

  if (isLoading || !data) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Earnings Overview</h1>
            <p className="text-muted-foreground">Detailed breakdown of platform earnings</p>
          </div>
          <SkeletonStats />
        </div>
      </AdminLayout>
    )
  }

  const mainStats = [
    { title: "Total Earn", value: `₹${data.total.earn.toLocaleString()}`, icon: DollarSign, color: "text-blue-600" },
    { title: "Earn Today", value: `₹${data.today.earn.toLocaleString()}`, icon: TrendingUp, color: "text-green-600" },
    { title: "Earn Yesterday", value: `₹${data.yesterday.earn.toLocaleString()}`, icon: Calendar, color: "text-orange-600" },
    { title: "Earn This Month", value: `₹${data.thisMonth.earn.toLocaleString()}`, icon: Calendar, color: "text-purple-600" },
    { title: "Earn This Year", value: `₹${data.thisYear.earn.toLocaleString()}`, icon: Calendar, color: "text-indigo-600" },
  ]

  const breakdowns = [
    { title: "Total Breakdown", stats: data.total },
    { title: "Today Breakdown", stats: data.today },
    { title: "Yesterday Breakdown", stats: data.yesterday },
    { title: "This Month Breakdown", stats: data.thisMonth },
    { title: "This Year Breakdown", stats: data.thisYear },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Earnings Overview</h1>
          <p className="text-muted-foreground">Platform revenue from Payin and Payout transactions</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {mainStats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {breakdowns.map((breakdown, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{breakdown.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowDownToLine className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Payin Earn</span>
                    </div>
                    <span className="font-bold">₹{breakdown.stats.payin.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowUpFromLine className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Payout Earn</span>
                    </div>
                    <span className="font-bold">₹{breakdown.stats.payout.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t flex items-center justify-between">
                    <span className="text-sm font-bold">Total</span>
                    <span className="text-lg font-bold text-primary">₹{breakdown.stats.earn.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Fee Structure Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-2 text-blue-700">OKPAY</h3>
                <ul className="space-y-1 text-sm">
                  <li><span className="font-medium">Payin:</span> 5.5%</li>
                  <li><span className="font-medium">Payout:</span> 3% + ₹6.00</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-green-700">VELOPAY</h3>
                <ul className="space-y-1 text-sm">
                  <li><span className="font-medium">Payin:</span> 4.5%</li>
                  <li><span className="font-medium">Payout:</span> 3% + ₹6.00</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
