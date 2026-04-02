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
  User,
  X,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const navItems = [
  {
    title: "Dashboard",
    href: "/merchant/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Payin Management",
    icon: ArrowDownToLine,
    items: [{ title: "Payin List", href: "/merchant/payin" }],
  },
  {
    title: "Payout Management",
    icon: ArrowUpFromLine,
    items: [{ title: "Payout List", href: "/merchant/payout" }],
  },
  {
    title: "Settlement Management",
    icon: Landmark,
    items: [{ title: "Settlement List", href: "/merchant/settlement" }],
  },
  {
    title: "Withdrawal Management",
    icon: Wallet,
    items: [
      { title: "Withdrawal List", href: "/merchant/withdrawals" },
      { title: "Add Withdrawal", href: "/merchant/withdrawals/add" },
    ],
  },
  {
    title: "My Profile",
    href: "/merchant/profile",
    icon: User,
  },
  {
    title: "API Documentation",
    href: "/merchant/api-docs",
    icon: BookOpen,
  },
  {
    title: "Notifications",
    href: "/merchant/notifications",
    icon: Bell,
  },
  {
    title: "Reports",
    icon: FileText,
    items: [
      { title: "Payin Report", href: "/merchant/reports/payin" },
      { title: "Payout Report", href: "/merchant/reports/payout" },
      { title: "Settlement Report", href: "/merchant/reports/settlement" },
      { title: "Withdrawal Report", href: "/merchant/reports/withdrawal" },
    ],
  },
]

export function AppSidebar() {
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
            <Link href="/merchant/dashboard" className="flex items-center gap-2 font-semibold">
              <Wallet className="h-6 w-6" />
              <span className="text-sidebar-foreground">Merchant Portal</span>
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
