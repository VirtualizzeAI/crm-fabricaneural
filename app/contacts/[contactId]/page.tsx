import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ContactProfileClient } from "./contact-profile-client"
import { getContact, getCustomFields } from "@/lib/actions/contacts"
import { getTags } from "@/lib/actions/tags"

export default async function ContactProfilePage({ params }: { params: Promise<{ contactId: string }> }) {
  const { contactId } = await params
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

  try {
    const contact = await getContact(contactId)
    const customFields = await getCustomFields()
    const tags = await getTags()

    return (
      <ContactProfileClient
        contact={contact}
        customFields={customFields}
        tags={tags}
        userRole={profile.role}
        userName={profile.full_name || "Usuário"}
      />
    )
  } catch (error) {
    redirect("/contacts")
  }
}
