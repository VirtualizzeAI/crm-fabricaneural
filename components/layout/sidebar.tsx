"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Kanban, LogOut, Building2, User, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"

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
      name: "Contatos",
      href: "/contacts",
      icon: User,
      roles: ["user", "admin", "super_admin"],
    },
    {
      name: "Perfil",
      href: "/profile",
      icon: User,
      roles: ["user", "admin", "super_admin"],
    },
    {
      name: "API Docs",
      href: "/api-docs",
      icon: FileText,
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
    <div className="flex h-full w-full md:w-64 flex-col border-r border-border bg-background">
      <div className="flex h-16 items-center border-b border-border px-4 md:px-6">
        <h1 className="text-lg md:text-xl font-bold text-foreground">Hub Fábrica Neural</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 md:px-3 py-4">
        {filteredNavigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="hidden md:inline">{item.name}</span>
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground hidden md:inline">Tema</span>
          <ThemeToggle />
        </div>
        <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleSignOut}>
          <LogOut className="mr-2 h-5 w-5" />
          <span className="hidden md:inline">Sair</span>
        </Button>
      </div>
    </div>
  )
}
