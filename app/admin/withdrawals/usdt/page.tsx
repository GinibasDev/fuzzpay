"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SkeletonTable } from "@/components/skeleton-loader"
import { Button } from "@/components/ui/button"
import { Check, X, Loader2 } from "lucide-react"

export default function AdminUSDTWithdrawalsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [processingId, setProcessingId] = useState<string | null>(null)

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch('/api/admin/withdrawals?type=usdt')
      const data = await res.json()
      setWithdrawals(data)
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWithdrawals()
  }, [])

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    setProcessingId(id)
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      if (res.ok) {
        fetchWithdrawals()
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to process')
      }
    } catch (error) {
      console.error('Action error:', error)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">USDT Withdrawals</h1>
          <p className="text-muted-foreground">View all USDT withdrawal requests</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>USDT Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonTable rows={5} cols={7} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Merchant</th>
                      <th className="text-left p-3 font-medium">INR Amount</th>
                      <th className="text-left p-3 font-medium">USDT Amount</th>
                      <th className="text-left p-3 font-medium">Wallet Address</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Created</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-4 text-center text-muted-foreground">No withdrawals found</td>
                      </tr>
                    ) : (
                      withdrawals.map((withdrawal) => (
                        <tr key={withdrawal._id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="p-3">{withdrawal.merchantName}</td>
                          <td className="p-3 font-medium">₹{withdrawal.amountINR.toLocaleString()}</td>
                          <td className="p-3 font-medium text-blue-600">{withdrawal.usdtAmount.toFixed(2)} USDT</td>
                          <td className="p-3 font-mono text-xs">{withdrawal.walletAddress}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              withdrawal.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              withdrawal.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {withdrawal.status}
                            </span>
                          </td>
                          <td className="p-3 text-xs">{new Date(withdrawal.createdAt).toLocaleString()}</td>
                          <td className="p-3">
                            {withdrawal.status === 'PENDING' && (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 w-8 p-0 text-green-600"
                                  onClick={() => handleAction(withdrawal._id, 'APPROVE')}
                                  disabled={!!processingId}
                                >
                                  {processingId === withdrawal._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 w-8 p-0 text-red-600"
                                  onClick={() => handleAction(withdrawal._id, 'REJECT')}
                                  disabled={!!processingId}
                                >
                                  {processingId === withdrawal._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
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
