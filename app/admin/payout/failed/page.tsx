"use client"

import { AdminLayout } from "@/components/admin-layout"
import { TransactionTable } from "@/components/transaction-table"

export default function FailedPayoutPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Failed Payout</h1>
          <p className="text-muted-foreground">Payouts that could not be processed</p>
        </div>
        <TransactionTable title="Failed Payout List" type="PAYOUT" status="FAILED" isAdmin={true} />
      </div>
    </AdminLayout>
  )
}
