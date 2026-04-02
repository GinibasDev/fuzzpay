"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  Landmark,
  Wallet,
  Bell,
  FileText,
  ChevronDown,
  Menu,
  Users,
  X,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const navItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Earnings",
    href: "/admin/earnings",
    icon: Landmark,
  },
  {
    title: "Payin Management",
    icon: ArrowDownToLine,
    items: [
      { title: "All Payin", href: "/admin/payin" },
      { title: "Pending Payin", href: "/admin/payin/pending" },
      { title: "Failed Payin", href: "/admin/payin/failed" },
    ],
  },
  {
    title: "Payout Management",
    icon: ArrowUpFromLine,
    items: [
      { title: "All Payout", href: "/admin/payout" },
      { title: "Pending Payout", href: "/admin/payout/pending" },
      { title: "Failed Payout", href: "/admin/payout/failed" },
    ],
  },
  {
    title: "Settlement Management",
    icon: Landmark,
    items: [
      { title: "All Settlement", href: "/admin/settlement" },
      { title: "Pending Settlement", href: "/admin/settlement/pending" },
      { title: "Completed Settlement", href: "/admin/settlement/completed" },
    ],
  },
  {
    title: "Withdrawal Management",
    icon: Wallet,
    items: [
      { title: "All Withdrawals", href: "/admin/withdrawals" },
      { title: "INR Withdrawals", href: "/admin/withdrawals/inr" },
      { title: "USDT Withdrawals", href: "/admin/withdrawals/usdt" },
      { title: "Pending Withdrawals", href: "/admin/withdrawals/pending" },
      { title: "Rejected Withdrawals", href: "/admin/withdrawals/rejected" },
    ],
  },
  {
    title: "Merchant Management",
    icon: Users,
    items: [
      { title: "All Merchants", href: "/admin/merchants" },
      { title: "Merchant Balance Logs", href: "/admin/merchants/balance-logs" },
      { title: "Merchant Fee History", href: "/admin/merchants/fee-history" },
    ],
  },
  {
    title: "Wallet Management",
    icon: Wallet,
    items: [
      { title: "INR Wallet", href: "/admin/wallet/inr" },
      { title: "USDT Wallet", href: "/admin/wallet/usdt" },
      { title: "Transaction Logs", href: "/admin/wallet/transaction-logs" },
    ],
  },
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
  },
  {
    title: "Reports",
    icon: FileText,
    items: [
      { title: "Payin Report", href: "/admin/reports/payin" },
      { title: "Payout Report", href: "/admin/reports/payout" },
      { title: "Settlement Report", href: "/admin/reports/settlement" },
      { title: "Withdrawal Report", href: "/admin/reports/withdrawal" },
    ],
  },
  {
    title: "System Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const [openMenus, setOpenMenus] = React.useState<string[]>([])

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-background shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-sidebar-border px-6">
            <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
              <Settings className="h-6 w-6" />
              <span className="text-sidebar-foreground">Admin Panel</span>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1">
              {navItems.map((item) =>
                item.items ? (
                  <Collapsible
                    key={item.title}
                    open={openMenus.includes(item.title)}
                    onOpenChange={() => toggleMenu(item.title)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span className="text-sm">{item.title}</span>
                        </div>
                        <ChevronDown
                          className={cn("h-4 w-4 transition-transform", openMenus.includes(item.title) && "rotate-180")}
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 pl-6 pt-1">
                      {item.items.map((subItem) => (
                        <Link key={subItem.href} href={subItem.href}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                              pathname === subItem.href && "bg-sidebar-accent text-sidebar-accent-foreground",
                            )}
                            onClick={() => setIsOpen(false)}
                          >
                            {subItem.title}
                          </Button>
                        </Link>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <Link key={item.href} href={item.href!}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        pathname === item.href && "bg-sidebar-accent text-sidebar-accent-foreground",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </Button>
                  </Link>
                ),
              )}
            </div>
          </nav>

          <div className="border-t border-sidebar-border p-4">
            <Link href="/login">
              <Button variant="outline" className="w-full bg-transparent" onClick={() => setIsOpen(false)}>
                Logout
              </Button>
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}
