"use client"

import { AdminLayout } from "@/components/admin-layout"
import { TransactionTable } from "@/components/transaction-table"

export default function PendingPayinPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Pending Payin</h1>
          <p className="text-muted-foreground">Transactions awaiting confirmation</p>
        </div>
        <TransactionTable title="Pending Payin List" type="PAYIN" status="PENDING" />
      </div>
    </AdminLayout>
  )
}
