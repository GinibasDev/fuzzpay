"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SkeletonForm } from "@/components/skeleton-loader"
import { Copy, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

export default function MerchantProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [showApiKey, setShowApiKey] = useState(false)
  const [merchantProfile, setMerchantProfile] = useState<any>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/merchant/profile')
        const data = await response.json()
        if (!data.error) {
          setMerchantProfile(data)
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text.toString())
    toast.success(`${label} copied to clipboard`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">View your merchant account details</p>
        </div>

        {isLoading ? (
          <SkeletonForm fields={8} />
        ) : merchantProfile ? (
          <Card>
            <CardHeader>
              <CardTitle>Merchant Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Merchant Name</label>
                  <p className="text-base font-medium mt-1">{merchantProfile.merchantName}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Merchant ID</label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-base font-medium">{merchantProfile.merchantId}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(merchantProfile.merchantId, "Merchant ID")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Balance</label>
                  <p className="text-base font-medium text-green-600 mt-1">{merchantProfile.balance}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Withdrawal Amount</label>
                  <p className="text-base font-medium mt-1">{merchantProfile.withdrawalAmount}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payin Rate</label>
                  <p className="text-base font-medium mt-1">{merchantProfile.payinRate}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payout Rate</label>
                  <p className="text-base font-medium mt-1">{merchantProfile.payoutRate}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Customer Number</label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-base font-medium">{merchantProfile.customerNumber}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(merchantProfile.customerNumber, "Customer number")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Payment Callback URL</label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-base font-medium break-all">{merchantProfile.paymentCallbackUrl}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(merchantProfile.paymentCallbackUrl, "Callback URL")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">API Key</label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-base font-medium font-mono break-all">
                      {showApiKey ? merchantProfile.apiKey : "••••••••••••••••••••••••••••••••"}
                    </p>
                    <Button variant="ghost" size="sm" onClick={() => setShowApiKey(!showApiKey)}>
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(merchantProfile.apiKey, "API Key")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center p-10 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">Failed to load merchant profile. Please try again later.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
