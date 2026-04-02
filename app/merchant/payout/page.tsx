"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SkeletonTable } from "@/components/skeleton-loader"
import { Search, Eye } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function MerchantPayoutPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [payouts, setPayouts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetch('/api/transactions?type=PAYOUT')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.transactions)) {
          setPayouts(data.transactions)
        } else if (Array.isArray(data)) {
          setPayouts(data)
        } else {
          setPayouts([])
        }
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch payouts:', err)
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  const filteredPayouts = payouts.filter(po => {
    const matchesSearch = 
      po.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.merchantOrderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.recipientName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "ALL" || po.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredPayouts.length / itemsPerPage)
  const paginatedPayouts = filteredPayouts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Payout Management</h1>
          <p className="text-muted-foreground">View all payout transactions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payout List</CardTitle>
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by order number, recipient..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonTable rows={5} cols={11} />
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium whitespace-nowrap">ID</th>
                        <th className="text-left p-3 font-medium whitespace-nowrap">Order Number</th>
                        <th className="text-left p-3 font-medium whitespace-nowrap">Merchant Order</th>
                        <th className="text-left p-3 font-medium whitespace-nowrap">Amount</th>
                        <th className="text-left p-3 font-medium whitespace-nowrap">Fee</th>
                        <th className="text-left p-3 font-medium whitespace-nowrap">Status</th>
                        <th className="text-left p-3 font-medium whitespace-nowrap">Recipient</th>
                        <th className="text-left p-3 font-medium whitespace-nowrap">Card</th>
                        <th className="text-left p-3 font-medium whitespace-nowrap">IFSC</th>
                        <th className="text-left p-3 font-medium whitespace-nowrap">Created</th>
                        <th className="text-left p-3 font-medium whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPayouts.map((payout) => (
                        <tr key={payout.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="p-3 whitespace-nowrap text-xs text-muted-foreground truncate max-w-[80px]" title={payout.id}>{payout.id}</td>
                          <td className="p-3 whitespace-nowrap font-medium">{payout.orderNumber}</td>
                          <td className="p-3 whitespace-nowrap">{payout.merchantOrderNumber || '-'}</td>
                          <td className="p-3 whitespace-nowrap font-medium">₹{payout.amount?.toLocaleString() || '0'}</td>
                          <td className="p-3 whitespace-nowrap text-red-600">₹{payout.serviceFee?.toLocaleString() || '0'}</td>
                          <td className="p-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                payout.status === "SUCCESS"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : payout.status === "FAILED"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              }`}
                            >
                              {payout.status}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">{payout.recipientName}</td>
                          <td className="p-3 whitespace-nowrap">{payout.cardNumber || '-'}</td>
                          <td className="p-3 whitespace-nowrap">{payout.ifsc || '-'}</td>
                          <td className="p-3 whitespace-nowrap text-xs">{new Date(payout.createdAt).toLocaleString()}</td>
                          <td className="p-3 whitespace-nowrap">
                            <Link href={`/merchant/payout/${payout.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {paginatedPayouts.length === 0 && (
                        <tr>
                          <td colSpan={11} className="p-8 text-center text-muted-foreground">
                            No payouts found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPayouts.length)} of {filteredPayouts.length} entries
                    </p>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault()
                              if (currentPage > 1) setCurrentPage(currentPage - 1)
                            }}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink 
                              href="#" 
                              isActive={currentPage === page}
                              onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage(page)
                              }}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault()
                              if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                            }}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
