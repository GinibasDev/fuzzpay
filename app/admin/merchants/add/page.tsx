"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Copy, Check, RefreshCw, DollarSign, TrendingUp } from "lucide-react"

export default function AddMerchantPage() {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState({
    merchantName: "",
    email: "",
    username: "",
    password: generatePassword(),
    customerNumber: "",
    payinRate: "7",
    payoutRate: "4",
    paymentCallbackUrl: "",
    initialBalance: "0",
    telegramChatId: "",
  })

  function generatePassword() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const copyPassword = () => {
    navigator.clipboard.writeText(formData.password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const regeneratePassword = () => {
    setFormData({ ...formData, password: generatePassword() })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/merchants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.merchantName,
          email: formData.email,
          username: formData.username,
          password: formData.password,
          businessType: formData.customerNumber,
          initialBalance: parseFloat(formData.initialBalance),
          payinRate: parseFloat(formData.payinRate),
          payoutRate: parseFloat(formData.payoutRate),
          telegramChatId: formData.telegramChatId,
        }),
      })

      if (response.ok) {
        router.push("/admin/merchants")
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create merchant')
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('An error occurred while creating merchant')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/merchants">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold mb-2">Add New Merchant</h1>
            <p className="text-muted-foreground">Create a new merchant account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the merchant's basic details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="merchantName">
                      Merchant Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="merchantName"
                      placeholder="Enter merchant name"
                      value={formData.merchantName}
                      onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="merchant@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">
                      Username <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="username"
                      placeholder="Enter username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerNumber">Customer Number</Label>
                    <Input
                      id="customerNumber"
                      placeholder="+91-1234567890"
                      value={formData.customerNumber}
                      onChange={(e) => setFormData({ ...formData, customerNumber: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Login Credentials</CardTitle>
                <CardDescription>Auto-generated password that can be copied and shared with merchant</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Auto-Generated Password</Label>
                  <div className="flex gap-2">
                    <Input id="password" value={formData.password} readOnly className="bg-muted font-mono flex-1" />
                    <Button type="button" variant="outline" size="icon" onClick={copyPassword}>
                      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button type="button" variant="outline" size="icon" onClick={regeneratePassword}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Copy this password and share it securely with the merchant. They can change it after first login.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Financial Settings</CardTitle>
                <CardDescription>Configure merchant rates and initial balance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Platform Base Rates (Our Cost)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="font-medium text-blue-700">OKPAY</p>
                      <p className="text-muted-foreground">Payin: 5.5% | Payout: 3% + ₹6</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-green-700">VELOPAY</p>
                      <p className="text-muted-foreground">Payin: 4.5% | Payout: 3% + ₹6</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic mt-2">
                    Note: Merchant rates should be higher than platform base rates to ensure profit.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2 text-blue-700">
                      <TrendingUp className="h-4 w-4" />
                      Estimated Profit (OKPAY)
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-muted-foreground">Payin Margin</p>
                        <p className={`font-bold ${(parseFloat(formData.payinRate || '0') - 5.5) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(parseFloat(formData.payinRate || '0') - 5.5).toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Payout Margin</p>
                        <p className={`font-bold ${(parseFloat(formData.payoutRate || '0') - 3) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(parseFloat(formData.payoutRate || '0') - 3).toFixed(2)}% - ₹6
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2 text-green-700">
                      <TrendingUp className="h-4 w-4" />
                      Estimated Profit (VELOPAY)
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-muted-foreground">Payin Margin</p>
                        <p className={`font-bold ${(parseFloat(formData.payinRate || '0') - 4.5) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(parseFloat(formData.payinRate || '0') - 4.5).toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Payout Margin</p>
                        <p className={`font-bold ${(parseFloat(formData.payoutRate || '0') - 3) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(parseFloat(formData.payoutRate || '0') - 3).toFixed(2)}% - ₹6
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="payinRate">Payin Rate (%)</Label>
                    <Input
                      id="payinRate"
                      type="number"
                      step="0.01"
                      placeholder="7"
                      value={formData.payinRate}
                      onChange={(e) => setFormData({ ...formData, payinRate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payoutRate">Payout Rate (%)</Label>
                    <Input
                      id="payoutRate"
                      type="number"
                      step="0.01"
                      placeholder="4"
                      value={formData.payoutRate}
                      onChange={(e) => setFormData({ ...formData, payoutRate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="initialBalance">Initial Balance (₹)</Label>
                    <Input
                      id="initialBalance"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={formData.initialBalance}
                      onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Integration Details</CardTitle>
                <CardDescription>Configure payment callback URL for this merchant</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentCallbackUrl">Payment Callback URL</Label>
                  <Textarea
                    id="paymentCallbackUrl"
                    placeholder="https://merchant.com/api/payment/callback"
                    value={formData.paymentCallbackUrl}
                    onChange={(e) => setFormData({ ...formData, paymentCallbackUrl: e.target.value })}
                    rows={2}
                  />
                  <p className="text-sm text-muted-foreground">
                    This URL will receive payment status callbacks and notifications
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telegramChatId">Telegram Support Group Chat ID</Label>
                  <Input
                    id="telegramChatId"
                    placeholder="-100123456789"
                    value={formData.telegramChatId}
                    onChange={(e) => setFormData({ ...formData, telegramChatId: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    The Telegram Chat ID for the support group where the bot is added
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="md:col-span-2 flex justify-end gap-4">
              <Link href="/admin/merchants">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit">Create Merchant</Button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
