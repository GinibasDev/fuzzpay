"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SkeletonTable } from "@/components/skeleton-loader"
import { Search, Send, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Transaction {
  id: string
  merchant: { name: string }
  orderNumber: string
  merchantOrderNumber: string
  amount: number
  paymentAmount?: number
  serviceFee: number
  status: string
  createdAt: string
  updatedAt: string
  channelName?: string
  bankDetails?: {
    account: string
    userName: string
    ifsc: string
  }
}

interface TransactionTableProps {
  title: string
  type: 'PAYIN' | 'PAYOUT'
  status?: 'PENDING' | 'SUCCESS' | 'FAILED'
  isAdmin?: boolean
}

export function TransactionTable({ title, type, status: initialStatus, isAdmin = false }: TransactionTableProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [currentStatus, setCurrentStatus] = useState<string>(initialStatus || 'ALL')

  const fetchTransactions = () => {
    setIsLoading(true)
    let url = `/api/transactions?type=${type}&page=${currentPage}&limit=10`
    if (currentStatus && currentStatus !== 'ALL') url += `&status=${currentStatus}`
    if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setTransactions(data.transactions || [])
        setTotalPages(data.pagination?.pages || 1)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch transactions:', err)
        setIsLoading(false)
      })
  }

  useEffect(() => {
    fetchTransactions()
  }, [type, currentStatus, currentPage])

  // Handle search with debounce or button click
  // For now let's just use an effect with a timer
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1)
      } else {
        fetchTransactions()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const sendToChannel = async (transactionId: string, channel: number) => {
    setIsProcessing(`${transactionId}-${channel}`)
    try {
      const response = await fetch('/api/admin/payout/send-to-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, channel })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success("Success", {
          description: `Payout sent to Channel ${channel} successfully`,
        })
        fetchTransactions()
      } else {
        toast.error("Error", {
          description: data.error || "Failed to send payout to channel",
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle>{title}</CardTitle>
          <div className="flex flex-wrap gap-2">
            {['ALL', 'PENDING', 'SUCCESS', 'FAILED'].map((s) => (
              <Button
                key={s}
                size="sm"
                variant={currentStatus === s ? "default" : "outline"}
                onClick={() => {
                  setCurrentStatus(s)
                  setCurrentPage(1)
                }}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by order number, merchant..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
                    <th className="text-left p-3 font-medium">Merchant</th>
                    <th className="text-left p-3 font-medium">Order Number</th>
                    <th className="text-left p-3 font-medium">Merchant Order</th>
                    <th className="text-left p-3 font-medium">Amount</th>
                    <th className="text-left p-3 font-medium">Pay Amount</th>
                    <th className="text-left p-3 font-medium">Fee</th>
                    <th className="text-left p-3 font-medium">Channel</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Created</th>
                    {isAdmin && type === 'PAYOUT' && <th className="text-left p-3 font-medium">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3 text-muted-foreground truncate max-w-[80px]" title={tx.id}>{tx.id}</td>
                      <td className="p-3">{tx.merchant?.name || 'N/A'}</td>
                      <td className="p-3">
                        <div>{tx.orderNumber}</div>
                        {tx.bankDetails && (
                          <div className="text-[10px] text-muted-foreground mt-1">
                            {tx.bankDetails.userName} | {tx.bankDetails.account} | {tx.bankDetails.ifsc}
                          </div>
                        )}
                      </td>
                      <td className="p-3">{tx.merchantOrderNumber || '-'}</td>
                      <td className="p-3 font-medium">₹{tx.amount?.toLocaleString() || '0'}</td>
                      <td className={`p-3 font-medium ${type === 'PAYIN' ? 'text-green-600' : 'text-blue-600'}`}>₹{tx.paymentAmount?.toLocaleString() || tx.amount?.toLocaleString() || '0'}</td>
                      <td className="p-3 text-red-600">₹{tx.serviceFee?.toLocaleString() || '0'}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase">
                          {tx.channelName || 'N/A'}
                        </span>
                      </td>
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
                      {isAdmin && type === 'PAYOUT' && (
                        <td className="p-3">
                          {tx.status === 'PENDING' ? (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 text-[10px]"
                                onClick={() => sendToChannel(tx.id, 1)}
                                disabled={isProcessing !== null}
                              >
                                {isProcessing === `${tx.id}-1` ? "..." : "OkPay"}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 text-[10px]"
                                onClick={() => sendToChannel(tx.id, 2)}
                                disabled={isProcessing !== null}
                              >
                                {isProcessing === `${tx.id}-2` ? "..." : "VeloPay"}
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">No actions</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-muted-foreground">
                        No transactions found
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
  )
}
