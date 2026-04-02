"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { LockKeyhole } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [requires2FA, setRequires2FA] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    twofaCode: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          twofaCode: requires2FA ? formData.twofaCode : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Login failed")
        return
      }

      if (data.requires2FA) {
        setRequires2FA(true)
        toast.info("Please enter your 2FA code")
        return
      }

      toast.success("Login successful")
      
      const targetDashboard = data.user.role === 'ADMIN' ? '/admin/dashboard' : '/merchant/dashboard'
      
      if (data.requiresSetup) {
        router.push(`${targetDashboard}?setup2fa=true`)
      } else {
        router.push(targetDashboard)
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-lg">
              <LockKeyhole className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!requires2FA ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    required 
                    disabled={isLoading}
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter your password" 
                    required 
                    disabled={isLoading}
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="twofaCode">2FA Code</Label>
                <Input
                  id="twofaCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                  disabled={isLoading}
                  value={formData.twofaCode}
                  onChange={handleChange}
                  autoFocus
                />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : requires2FA ? "Verify Code" : "Sign In"}
            </Button>
            {requires2FA && (
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full" 
                onClick={() => setRequires2FA(false)}
                disabled={isLoading}
              >
                Back to Login
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
