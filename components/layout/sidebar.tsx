"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Kanban, LogOut, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface SidebarProps {
  userRole: string
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const navigation = [
    {
      name: "Painel",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["user", "admin", "super_admin"],
    },
    {
      name: "Quadros Kanban",
      href: "/boards",
      icon: Kanban,
      roles: ["user", "admin", "super_admin"],
    },
    {
      name: "Super Admin",
      href: "/super-admin",
      icon: Building2,
      roles: ["super_admin"],
    },
  ]

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const filteredNavigation = navigation.filter((item) => item.roles.includes(userRole))

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <h1 className="text-xl font-bold text-slate-900">Kanban CRM</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNavigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-slate-200 p-4">
        <Button
          variant="outline"
          className="w-full justify-start border-slate-300 text-slate-700 hover:bg-slate-100 bg-transparent"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  )
}
