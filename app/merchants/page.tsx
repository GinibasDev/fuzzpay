"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SkeletonTable } from "@/components/skeleton-loader"
import { Plus, Search, Eye } from "lucide-react"

export default function MerchantListPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1200)
  }, [])

  const merchants = [
    {
      id: "MCH001",
      name: "Merchant A",
      merchantId: "MER_A_12345",
      status: "Active",
      balance: "₹150,000",
    },
    {
      id: "MCH002",
      name: "Merchant B",
      merchantId: "MER_B_67890",
      status: "Active",
      balance: "₹250,000",
    },
    {
      id: "MCH003",
      name: "Merchant C",
      merchantId: "MER_C_11111",
      status: "Inactive",
      balance: "₹50,000",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Merchant Management</h1>
            <p className="text-muted-foreground">Manage all merchant accounts</p>
          </div>
          <Link href="/merchants/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Merchant
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Merchant List</CardTitle>
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name, merchant ID..." className="pl-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonTable rows={5} cols={6} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium whitespace-nowrap">ID</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Merchant Name</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Merchant ID</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Status</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Balance</th>
                      <th className="text-left p-3 font-medium whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {merchants.map((merchant) => (
                      <tr key={merchant.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-3 whitespace-nowrap">{merchant.id}</td>
                        <td className="p-3 whitespace-nowrap font-medium">{merchant.name}</td>
                        <td className="p-3 whitespace-nowrap">{merchant.merchantId}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              merchant.status === "Active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {merchant.status}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap font-medium">{merchant.balance}</td>
                        <td className="p-3 whitespace-nowrap">
                          <Link href={`/merchants/${merchant.id}`}>
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
