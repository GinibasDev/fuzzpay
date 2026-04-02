"use client"

import { AdminLayout } from "@/components/admin-layout"
import { TransactionTable } from "@/components/transaction-table"

export default function FailedPayinPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Failed Payin</h1>
          <p className="text-muted-foreground">Transactions that could not be completed</p>
        </div>
        <TransactionTable title="Failed Payin List" type="PAYIN" status="FAILED" />
      </div>
    </AdminLayout>
  )
}
