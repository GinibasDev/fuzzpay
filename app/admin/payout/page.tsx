"use client"

import { AdminLayout } from "@/components/admin-layout"
import { TransactionTable } from "@/components/transaction-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function AdminPayoutPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">All Payout Transactions</h1>
            <p className="text-muted-foreground">View and manage all outgoing payments</p>
          </div>
          <Link href="/admin/payout/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Payout
            </Button>
          </Link>
        </div>
        <TransactionTable title="Payout List" type="PAYOUT" isAdmin={true} />
      </div>
    </AdminLayout>
  )
}
