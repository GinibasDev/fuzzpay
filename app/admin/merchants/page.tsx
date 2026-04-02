"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SkeletonTable } from "@/components/skeleton-loader"
import { Search, Plus } from "lucide-react"

export default function AdminMerchantsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [merchants, setMerchants] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchMerchants = async () => {
    setIsLoading(true)
    try {
      let url = `/api/merchants?page=${currentPage}&limit=10`
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setMerchants(data.merchants || [])
        setTotalPages(data.pagination?.pages || 1)
      }
    } catch (error) {
      console.error('Fetch merchants error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMerchants()
  }, [currentPage])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1)
      } else {
        fetchMerchants()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">All Merchants</h1>
            <p className="text-muted-foreground">View and manage all registered merchants</p>
          </div>
          <Link href="/admin/merchants/add">
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
                <Input 
                  placeholder="Search merchants..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonTable rows={5} cols={8} />
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">ID</th>
                        <th className="text-left p-3 font-medium">Name</th>
                        <th className="text-left p-3 font-medium">Email</th>
                        <th className="text-left p-3 font-medium">Balance</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Created</th>
                        <th className="text-right p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {merchants.map((merchant) => (
                        <tr key={merchant.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="p-3">
                            <span className="font-mono text-xs">{merchant.id}</span>
                          </td>
                          <td className="p-3">{merchant.name}</td>
                          <td className="p-3">{merchant.email}</td>
                          <td className="p-3 font-medium">₹{merchant.wallet?.balance?.toLocaleString() || '0'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              merchant.status === "ACTIVE" 
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}>
                              {merchant.status}
                            </span>
                          </td>
                          <td className="p-3 text-xs">{new Date(merchant.createdAt).toLocaleDateString()}</td>
                          <td className="p-3 text-right">
                            <Link href={`/admin/merchants/${merchant.id}`}>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {merchants.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-muted-foreground">
                            No merchants found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-between items-center px-2 py-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum = currentPage;
                          if (currentPage <= 3) pageNum = i + 1;
                          else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                          else pageNum = currentPage - 2 + i;
                          
                          if (pageNum <= 0 || pageNum > totalPages) return null;

                          return (
                            <Button
                              key={pageNum}
                              size="sm"
                              variant={currentPage === pageNum ? "default" : "outline"}
                              className="w-8 h-8 p-0"
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
