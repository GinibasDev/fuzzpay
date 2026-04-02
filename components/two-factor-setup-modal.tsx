"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function TwoFactorSetupModal({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState(1)
  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && step === 1) {
      fetchSetup()
    }
  }, [isOpen])

  const fetchSetup = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/2fa/setup")
      const data = await response.json()
      if (response.ok) {
        setQrCode(data.qrCodeUrl)
        setSecret(data.secret)
      } else {
        toast.error(data.error || "Failed to load 2FA setup")
      }
    } catch (error) {
      toast.error("An error occurred while setting up 2FA")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode }),
      })
      const data = await response.json()
      if (response.ok) {
        toast.success("2FA enabled successfully!")
        onOpenChange(false)
      } else {
        toast.error(data.error || "Invalid code")
      }
    } catch (error) {
      toast.error("An error occurred during verification")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome! Setup 2FA Authenticator</DialogTitle>
          <DialogDescription>
            Your account has been created successfully. For your security, please setup 2FA authenticator.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {step === 1 ? (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                {qrCode ? (
                  <div className="bg-white p-2 rounded-lg">
                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-muted animate-pulse rounded-lg" />
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                {secret && (
                  <div className="text-xs font-mono bg-muted p-2 rounded break-all">
                    Secret: {secret}
                  </div>
                )}
              </div>
              <Button onClick={() => setStep(2)} className="w-full">Next</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  placeholder="Enter 6-digit code from app"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button onClick={handleVerify} disabled={isLoading} className="flex-1">
                  {isLoading ? "Verifying..." : "Verify & Enable"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
