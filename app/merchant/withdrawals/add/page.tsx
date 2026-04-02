"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function AddWithdrawalPage() {
  const router = useRouter()
  const [withdrawalType, setWithdrawalType] = useState("inr")
  const [amount, setAmount] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [settings, setSettings] = useState({ usdt_rate: 90, min_usdt_withdrawal: 1000 })
  const [profile, setProfile] = useState<any>(null)
  
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: ""
  })

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => setSettings(data))
    fetch('/api/merchant/profile').then(res => res.json()).then(data => setProfile(data))
  }, [])

  const calculateUsdtValue = () => {
    const amountNum = Number.parseFloat(amount) || 0
    return (amountNum / settings.usdt_rate).toFixed(2)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/merchant/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: withdrawalType,
          amountINR: parseFloat(amount),
          walletAddress: withdrawalType === 'usdt' ? walletAddress : undefined,
          bankDetails: withdrawalType === 'inr' ? bankDetails : undefined
        })
      })

      if (response.ok) {
        router.push('/merchant/withdrawals')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to submit withdrawal')
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <Link href="/merchant/withdrawals">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Add Withdrawal</h1>
            <p className="text-muted-foreground">Create a new withdrawal request</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Withdrawal Type</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={withdrawalType} onValueChange={setWithdrawalType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inr" id="inr" />
                <Label htmlFor="inr">INR Withdrawal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="usdt" id="usdt" />
                <Label htmlFor="usdt">USDT Withdrawal</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {withdrawalType === "inr" ? (
          <Card>
            <CardHeader>
              <CardTitle>INR Withdrawal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Merchant ID</Label>
                <Input value={profile?.merchantId || "Loading..."} disabled />
              </div>

              <div className="space-y-2">
                <Label>Withdrawal Amount (INR)</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Bank Details</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Account Holder Name</Label>
                    <Input 
                      placeholder="Enter account holder name" 
                      value={bankDetails.accountHolderName}
                      onChange={(e) => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input 
                      placeholder="Enter bank name" 
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input 
                      placeholder="Enter account number" 
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>IFSC Code</Label>
                    <Input 
                      placeholder="Enter IFSC code" 
                      value={bankDetails.ifscCode}
                      onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <Label>Current Balance</Label>
                  <Input value={profile?.balance || "Loading..."} disabled />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Withdrawal
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setAmount("")}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>USDT Withdrawal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Merchant ID</Label>
                <Input value={profile?.merchantId || "Loading..."} disabled />
              </div>

              <div className="space-y-2">
                <Label>Withdrawal Amount (INR)</Label>
                <Input
                  type="number"
                  placeholder="Enter INR amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <div className="mt-4 p-4 bg-muted rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Settlement date:</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Merchant ID:</span>
                    <span>{profile?.merchantId || "Loading..."}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Country of origin:</span>
                    <span>IND</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Settlement amount:</span>
                    <span className="font-semibold">₹{parseFloat(amount || "0").toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-muted-foreground">Settlement exchange rate:</span>
                    <span>1 USDT = ₹{settings.usdt_rate}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-primary">
                    <span>USDT to receive:</span>
                    <span>{calculateUsdtValue()} USDT</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Min withdrawal: {settings.min_usdt_withdrawal} USDT (₹{settings.min_usdt_withdrawal * settings.usdt_rate})
                </p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Wallet Details</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Wallet Address (TRC20 Only)</Label>
                    <Input 
                      placeholder="Enter USDT TRC20 wallet address" 
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <Label>Current Balance</Label>
                  <Input value={profile?.balance || "Loading..."} disabled />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Withdrawal
                </Button>
                <Link href="/merchant/withdrawals" className="flex-1">
                  <Button variant="ghost" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
