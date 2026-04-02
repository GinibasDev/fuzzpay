"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Link as LinkIcon, Copy, ExternalLink, ArrowLeft } from "lucide-react"

export default function MerchantCreatePayinPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState("")
  const [formData, setFormData] = useState({
    amount: "",
    orderNumber: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('/api/merchant/payin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setPaymentUrl(data.paymentUrl)
        toast.success("Payment link generated successfully!")
      } else {
        toast.error(data.error || "Failed to generate payment link")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentUrl)
    toast.success("Copied to clipboard!")
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-1">Create Payment Link</h1>
            <p className="text-muted-foreground">Generate a checkout link for your customers</p>
          </div>
        </div>

        {!paymentUrl ? (
          <Card>
            <CardHeader>
              <CardTitle>Link Details</CardTitle>
              <CardDescription>Enter the amount (₹100 - ₹50,000) and an optional order reference</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="100"
                    max="50000"
                    placeholder="0.00"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orderNumber">Order Number (Reference)</Label>
                  <Input
                    id="orderNumber"
                    type="text"
                    required
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                    disabled={isLoading}
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Generating..." : "Generate Link"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-primary text-primary-foreground p-3 rounded-full">
                  <LinkIcon className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-center text-xl">Your Link is Ready!</CardTitle>
              <CardDescription className="text-center">
                Share this link with your customer to receive payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
                <div className="flex-1 truncate text-sm font-mono">
                  {paymentUrl}
                </div>
                <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full" onClick={() => setPaymentUrl("")}>
                  Create Another
                </Button>
                <Button 
                  className="w-full gap-2" 
                  onClick={() => window.open(paymentUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  Test Link
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
