import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ApiDocsClient } from "./api-docs-client"
import { getApiKeys } from "@/lib/actions/api-keys"

export default async function ApiDocsPage() {
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

  const apiKeys = await getApiKeys()

  return <ApiDocsClient apiKeys={apiKeys} userRole={profile.role} />
}
