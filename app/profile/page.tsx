import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/sidebar"
import { ProfileClient } from "./profile-client"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile data
  const { data: profile } = await supabase.from("users").select("role, full_name").eq("id", user.id).single()

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar userRole={profile?.role || "user"} />
      <div className="flex-1 overflow-auto">
        <ProfileClient user={user} fullName={profile?.full_name || ""} />
      </div>
    </div>
  )
}
