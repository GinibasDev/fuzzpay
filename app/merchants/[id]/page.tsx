"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { SkeletonForm } from "@/components/skeleton-loader"
import { ArrowLeft, Edit, Copy, Check } from "lucide-react"

export default function MerchantDetailPage() {
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1200)
  }, [])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  // Mock merchant data
  const merchant = {
    id: params.id,
    name: "Merchant A",
    merchantId: "MER_A_12345",
    balance: "₹150,000.00",
    withdrawalAmount: "₹25,000.00",
    collectionFeeRate: "2.5%",
    paymentRate: "1.8%",
    customerNumber: "+91-9876543210",
    paymentCallbackUrl: "https://merchant-a.com/api/payment/callback",
    status: "Active",
    email: "merchant-a@example.com",
    registeredDate: "2024-01-15",
    lastTransaction: "2024-12-01",
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/merchants">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold mb-2">Merchant Details</h1>
              <p className="text-muted-foreground">View and manage merchant information</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        {isLoading ? (
          <SkeletonForm rows={8} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Basic Information</CardTitle>
                  <Badge variant={merchant.status === "Active" ? "default" : "secondary"}>{merchant.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Merchant Name</Label>
                  <Input value={merchant.name} readOnly className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label>Merchant ID</Label>
                  <div className="flex gap-2">
                    <Input value={merchant.merchantId} readOnly className="bg-muted flex-1" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(merchant.merchantId, "merchantId")}
                    >
                      {copied === "merchantId" ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input value={merchant.email} readOnly className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label>Customer Number</Label>
                  <div className="flex gap-2">
                    <Input value={merchant.customerNumber} readOnly className="bg-muted flex-1" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(merchant.customerNumber, "customerNumber")}
                    >
                      {copied === "customerNumber" ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Registered Date</Label>
                    <Input value={merchant.registeredDate} readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Transaction</Label>
                    <Input value={merchant.lastTransaction} readOnly className="bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Balance</Label>
                  <Input value={merchant.balance} readOnly className="bg-muted font-bold text-lg" />
                </div>

                <div className="space-y-2">
                  <Label>Withdrawal Amount</Label>
                  <Input value={merchant.withdrawalAmount} readOnly className="bg-muted" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Collection Fee Rate</Label>
                    <Input value={merchant.collectionFeeRate} readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Rate</Label>
                    <Input value={merchant.paymentRate} readOnly className="bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Integration Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Callback URL</Label>
                  <div className="flex gap-2">
                    <Input value={merchant.paymentCallbackUrl} readOnly className="bg-muted flex-1" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(merchant.paymentCallbackUrl, "callbackUrl")}
                    >
                      {copied === "callbackUrl" ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This URL will receive payment status callbacks and notifications
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
