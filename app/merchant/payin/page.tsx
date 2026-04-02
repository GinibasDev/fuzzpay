"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SkeletonTable } from "@/components/skeleton-loader"
import { Search, Eye, Plus, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard-layout"
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

interface Transaction {
  id: string
  orderNumber: string
  merchantOrderNumber: string
  amount?: number
  paymentAmount?: number
  serviceFee?: number
  status: string
  createdAt: string
  updatedAt: string
  gatewayTransactionId?: string
  channelName?: string // This will be undefined for merchants
}

export default function MerchantPayinPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetch('/api/transactions?type=PAYIN')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.transactions)) {
          setTransactions(data.transactions)
        } else if (Array.isArray(data)) {
          setTransactions(data)
        } else {
          setTransactions([])
        }
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch transactions:', err)
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.merchantOrderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "ALL" || tx.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Payin Management</h1>
            <p className="text-muted-foreground">View all payin transactions</p>
          </div>
          <Link href="/merchant/payin/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Payment Link
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payin List</CardTitle>
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by order number..." 
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
              <SkeletonTable rows={5} cols={10} />
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">ID</th>
                        <th className="text-left p-3 font-medium">Order Number</th>
                        <th className="text-left p-3 font-medium">Merchant Order</th>
                        <th className="text-left p-3 font-medium">Channel</th>
                        <th className="text-left p-3 font-medium">Amount</th>
                        <th className="text-left p-3 font-medium">Pay Amount</th>
                        <th className="text-left p-3 font-medium">Fee</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Created</th>
                        <th className="text-left p-3 font-medium">Pay Link</th>
                        <th className="text-left p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTransactions.map((tx) => (
                        <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="p-3 text-muted-foreground truncate max-w-[80px]" title={tx.id}>{tx.id}</td>
                          <td className="p-3 font-medium">{tx.orderNumber}</td>
                          <td className="p-3">{tx.merchantOrderNumber || '-'}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="font-normal">
                              {tx.channelName || 'Channel 1'}
                            </Badge>
                          </td>
                          <td className="p-3">₹{tx.amount?.toLocaleString() || '0'}</td>
                          <td className="p-3 font-medium text-green-600">₹{tx.paymentAmount?.toLocaleString() || '0'}</td>
                          <td className="p-3 text-red-600">₹{tx.serviceFee?.toLocaleString() || '0'}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                tx.status === "SUCCESS"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : tx.status === "FAILED"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td className="p-3 text-xs">{new Date(tx.createdAt).toLocaleString()}</td>
                          <td className="p-3">
                            {tx.status === 'PENDING' ? (
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="h-auto p-0"
                                onClick={() => window.open(`https://api.wpay.one/v1/Pay?transactionId=${tx.gatewayTransactionId}`, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Link
                              </Button>
                            ) : '-'}
                          </td>
                          <td className="p-3">
                            <Link href={`/merchant/payin/${tx.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {paginatedTransactions.length === 0 && (
                        <tr>
                          <td colSpan={11} className="p-8 text-center text-muted-foreground">
                            No transactions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} entries
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
