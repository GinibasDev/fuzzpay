"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    usdt_rate: 90,
    min_usdt_withdrawal: 1000
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      if (data && !data.error) {
        setSettings({
          usdt_rate: data.usdt_rate || 90,
          min_usdt_withdrawal: data.min_usdt_withdrawal || 1000
        })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        toast({
          title: "Settings updated",
          description: "System settings have been updated successfully."
        })
      } else {
        throw new Error('Failed to update settings')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">System Settings</h1>
          <p className="text-muted-foreground">Configure global system parameters</p>
        </div>

        <form onSubmit={handleSave}>
          <div className="max-w-2xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>USDT Settings</CardTitle>
                <CardDescription>Configure USDT exchange rates and limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="usdt_rate">USDT Exchange Rate (1 USDT = ₹)</Label>
                  <Input
                    id="usdt_rate"
                    type="number"
                    step="0.01"
                    value={settings.usdt_rate}
                    onChange={(e) => setSettings({ ...settings, usdt_rate: parseFloat(e.target.value) })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This rate is used to calculate USDT amount for merchant withdrawals.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_usdt_withdrawal">Minimum USDT Withdrawal</Label>
                  <Input
                    id="min_usdt_withdrawal"
                    type="number"
                    value={settings.min_usdt_withdrawal}
                    onChange={(e) => setSettings({ ...settings, min_usdt_withdrawal: parseFloat(e.target.value) })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum USDT amount a merchant can request for withdrawal.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Settings
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
