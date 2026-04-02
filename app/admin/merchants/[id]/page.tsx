"use client"

import type React from "react"
import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2, DollarSign, TrendingUp } from "lucide-react"

export default function EditMerchantPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    businessType: "",
    payinRate: "7",
    payoutRate: "4",
    telegramChatId: "",
    status: "ACTIVE",
  })

  useEffect(() => {
    fetchMerchant()
  }, [id])

  const fetchMerchant = async () => {
    try {
      const response = await fetch(`/api/merchants/${id}`)
      if (response.ok) {
        const data = await response.json()
        setFormData({
          name: data.name || "",
          email: data.email || "",
          username: data.username || "",
          businessType: data.businessType || "",
          payinRate: data.payinRate?.toString() || "7",
          payoutRate: data.payoutRate?.toString() || "4",
          telegramChatId: data.telegramChatId || "",
          status: data.status || "ACTIVE",
        })
      } else {
        alert("Failed to fetch merchant details")
        router.push("/admin/merchants")
      }
    } catch (error) {
      console.error("Fetch merchant error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const response = await fetch(`/api/merchants/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          businessType: formData.businessType,
          payinRate: parseFloat(formData.payinRate),
          payoutRate: parseFloat(formData.payoutRate),
          telegramChatId: formData.telegramChatId,
          status: formData.status,
        }),
      })

      if (response.ok) {
        router.push("/admin/merchants")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update merchant")
      }
    } catch (error) {
      console.error("Submit error:", error)
      alert("An error occurred while updating merchant")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    )
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
            <h1 className="text-3xl font-bold mb-2">Edit Merchant</h1>
            <p className="text-muted-foreground">Update merchant details and settings</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Merchant identity and status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Merchant Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Account Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 text-muted-foreground">
                    <Label>Email Address (ReadOnly)</Label>
                    <Input value={formData.email} readOnly disabled className="bg-muted cursor-not-allowed" />
                  </div>

                  <div className="space-y-2 text-muted-foreground">
                    <Label>Username (ReadOnly)</Label>
                    <Input value={formData.username} readOnly disabled className="bg-muted cursor-not-allowed" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType">Customer Number / Business Type</Label>
                    <Input
                      id="businessType"
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Financial Settings</CardTitle>
                <CardDescription>Configure merchant transaction rates</CardDescription>
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

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="payinRate">Payin Rate (%)</Label>
                    <Input
                      id="payinRate"
                      type="number"
                      step="0.01"
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
                      value={formData.payoutRate}
                      onChange={(e) => setFormData({ ...formData, payoutRate: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Integration Details</CardTitle>
                <CardDescription>Telegram bot and group configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="telegramChatId">Telegram Support Group Chat ID</Label>
                  <Input
                    id="telegramChatId"
                    placeholder="-100123456789"
                    value={formData.telegramChatId}
                    onChange={(e) => setFormData({ ...formData, telegramChatId: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    The Telegram Chat ID for the support group linked to this merchant
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
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
