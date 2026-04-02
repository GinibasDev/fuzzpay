"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AddPayoutPage() {
  const router = useRouter()
  const [merchants, setMerchants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    merchantId: "",
    amount: "",
    orderNumber: "",
    merchantOrderNumber: "",
    serviceFee: "0",
    gateway: "OKPAY",
    recipientName: "",
    cardNumber: "",
    ifsc: "",
  })

  useEffect(() => {
    fetch('/api/merchants')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.merchants)) {
          setMerchants(data.merchants)
        } else if (Array.isArray(data)) {
          setMerchants(data)
        } else {
          setMerchants([])
        }
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          serviceFee: parseFloat(formData.serviceFee),
          type: 'PAYOUT',
        }),
      })

      if (response.ok) {
        router.push("/admin/payout")
      } else {
        const err = await response.json()
        alert(err.error || 'Failed to create transaction')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Add Manual Payout</h1>
          <p className="text-muted-foreground">Create a new outgoing transaction manually</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Merchant</Label>
                <Select onValueChange={(v) => setFormData({ ...formData, merchantId: v })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Merchant" />
                  </SelectTrigger>
                  <SelectContent>
                    {merchants.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input 
                    type="number" 
                    required 
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Service Fee (₹)</Label>
                  <Input 
                    type="number" 
                    value={formData.serviceFee}
                    onChange={(e) => setFormData({ ...formData, serviceFee: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Order Number</Label>
                  <Input 
                    required 
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Merchant Order Number</Label>
                  <Input 
                    value={formData.merchantOrderNumber}
                    onChange={(e) => setFormData({ ...formData, merchantOrderNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-sm">Recipient Details</h3>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input 
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Account / Card Number</Label>
                    <Input 
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>IFSC Code</Label>
                    <Input 
                      value={formData.ifsc}
                      onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label>Gateway (Channel)</Label>
                <Select 
                  defaultValue="OKPAY" 
                  onValueChange={(v) => setFormData({ ...formData, gateway: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Gateway" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OKPAY">OKPAY</SelectItem>
                    <SelectItem value="VELOPAY">VELOPAY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Payout'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
