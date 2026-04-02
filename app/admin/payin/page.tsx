"use client"

import { AdminLayout } from "@/components/admin-layout"
import { TransactionTable } from "@/components/transaction-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function AdminPayinPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">All Payin Transactions</h1>
            <p className="text-muted-foreground">View and manage all incoming payments</p>
          </div>
          <Link href="/admin/payin/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Payin
            </Button>
          </Link>
        </div>
        <TransactionTable title="Payin List" type="PAYIN" />
      </div>
    </AdminLayout>
  )
}
