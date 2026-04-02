"use client"

import { AdminLayout } from "@/components/admin-layout"
import { TransactionTable } from "@/components/transaction-table"

export default function PendingPayoutPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Pending Payout</h1>
          <p className="text-muted-foreground">Payouts awaiting processing</p>
        </div>
        <TransactionTable title="Pending Payout List" type="PAYOUT" status="PENDING" isAdmin={true} />
      </div>
    </AdminLayout>
  )
}
