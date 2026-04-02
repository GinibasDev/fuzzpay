"use client"

import type React from "react"
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { DollarSign, Wallet } from "lucide-react"

export default function AddWithdrawalPage() {
  const [withdrawalType, setWithdrawalType] = useState<"inr" | "usdt">("inr")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMerchant, setSelectedMerchant] = useState("")
  const [amount, setAmount] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  const calculateNetAmount = () => {
    const amountNum = Number.parseFloat(amount) || 0
    const fee = amountNum * 0.02
    return amountNum - fee
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Add New Withdrawal</CardTitle>
            <CardDescription>Create a new withdrawal request for INR or USDT</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Withdrawal Type Selection */}
              <div className="space-y-3">
                <Label>Select Withdrawal Type</Label>
                <RadioGroup
                  value={withdrawalType}
                  onValueChange={(value) => setWithdrawalType(value as "inr" | "usdt")}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <div className="flex-1">
                    <label
                      htmlFor="inr"
                      className={`flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        withdrawalType === "inr"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value="inr" id="inr" />
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        <span className="font-medium">INR Withdrawal</span>
                      </div>
                    </label>
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="usdt"
                      className={`flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        withdrawalType === "usdt"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value="usdt" id="usdt" />
                      <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        <span className="font-medium">USDT Withdrawal</span>
                      </div>
                    </label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              {/* Common Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="merchant">Merchant Name</Label>
                  <Select value={selectedMerchant} onValueChange={setSelectedMerchant}>
                    <SelectTrigger id="merchant">
                      <SelectValue placeholder="Select merchant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="merchant1">Merchant One</SelectItem>
                      <SelectItem value="merchant2">Merchant Two</SelectItem>
                      <SelectItem value="merchant3">Merchant Three</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="merchantId">Merchant ID</Label>
                  <Input
                    id="merchantId"
                    type="text"
                    placeholder="Auto-filled"
                    value={selectedMerchant ? `MER${selectedMerchant.toUpperCase()}` : ""}
                    disabled
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderNumber">Order Number</Label>
                  <Input id="orderNumber" type="text" placeholder="Auto-generated or manual" disabled={isLoading} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Withdrawal Amount ({withdrawalType === "inr" ? "INR" : "USDT"})</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <Separator />

              {/* Type-Specific Fields */}
              {withdrawalType === "inr" ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Bank Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accountHolder">Account Holder Name</Label>
                      <Input
                        id="accountHolder"
                        type="text"
                        placeholder="Enter full name"
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input id="bankName" type="text" placeholder="Enter bank name" disabled={isLoading} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        type="text"
                        placeholder="Enter account number"
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ifsc">IFSC Code</Label>
                      <Input id="ifsc" type="text" placeholder="Enter IFSC code" disabled={isLoading} required />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Wallet Details</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="walletAddress">Wallet Address</Label>
                      <Input
                        id="walletAddress"
                        type="text"
                        placeholder="Enter USDT wallet address"
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="network">Blockchain Network</Label>
                      <Select defaultValue="trc20">
                        <SelectTrigger id="network">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="trc20">TRC20</SelectItem>
                          <SelectItem value="erc20">ERC20</SelectItem>
                          <SelectItem value="bep20">BEP20</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Fees & Summary */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Fees & Summary</h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Withdrawal Amount:</span>
                    <span className="font-medium">
                      {amount || "0.00"} {withdrawalType === "inr" ? "INR" : "USDT"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {withdrawalType === "usdt" ? "Network Fee + Payout Fee:" : "Payout Fee:"}
                    </span>
                    <span className="font-medium text-destructive">
                      -{(Number.parseFloat(amount) * 0.02 || 0).toFixed(2)} {withdrawalType === "inr" ? "INR" : "USDT"}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Net Payable Amount:</span>
                    <span className="font-bold text-primary">
                      {calculateNetAmount().toFixed(2)} {withdrawalType === "inr" ? "INR" : "USDT"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Balance:</span>
                    <span className="font-medium">10,000.00 {withdrawalType === "inr" ? "INR" : "USDT"}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Status & Control */}
              <div className="space-y-3">
                <Label>Do Not Notify</Label>
                <RadioGroup defaultValue="no" className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="notify-yes" />
                    <Label htmlFor="notify-yes" className="font-normal cursor-pointer">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="notify-no" />
                    <Label htmlFor="notify-no" className="font-normal cursor-pointer">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit Withdrawal"}
                </Button>
                <Button type="reset" variant="outline" className="flex-1 bg-transparent" disabled={isLoading}>
                  Reset
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  disabled={isLoading}
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
