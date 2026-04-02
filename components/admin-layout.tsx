"use client"

import type React from "react"

import { AdminSidebar } from "@/components/admin-sidebar"

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8">{children}</main>
    </div>
  )
}
