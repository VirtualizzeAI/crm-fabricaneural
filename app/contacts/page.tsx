import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ContactsClient } from "./contacts-client"
import { getContacts, getCustomFields } from "@/lib/actions/contacts"
import { getTags } from "@/lib/actions/tags"

export default async function ContactsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  const contacts = await getContacts()
  const customFields = await getCustomFields()
  const tags = await getTags()

  return (
    <ContactsClient
      initialContacts={contacts}
      customFields={customFields}
      tags={tags}
      userRole={profile.role}
      userName={profile.full_name || "Usuário"}
    />
  )
}
