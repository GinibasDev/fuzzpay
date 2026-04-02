"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function PayInProcessPage() {
  const { id } = useParams()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initiatePayment = async () => {
      try {
        const response = await fetch(`/api/payin/initiate/${id}`, {
          method: "POST",
        })
        const result = await response.json()

        if (result.success && result.paymentUrl) {
          window.location.href = result.paymentUrl
        } else {
          setError(result.error || "Failed to initiate payment. Please contact support.")
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again.")
      }
    }

    if (id) {
      initiatePayment()
    }
  }, [id])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>FuzzPay Checkout</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4 py-8">
          {error ? (
            <div className="text-red-500 text-center">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">Processing your payment...</p>
                <p className="text-sm text-muted-foreground">
                  Please do not close this window or press the back button.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
