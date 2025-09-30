import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getDashboardStats, getRecentLeads } from "@/lib/actions/dashboard"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  const stats = await getDashboardStats(30)
  const recentLeads = await getRecentLeads(10)

  return (
    <DashboardClient
      initialStats={stats}
      initialLeads={recentLeads}
      userRole={profile.role}
      userName={profile.full_name || profile.email}
    />
  )
}
