import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ContactsClient } from "./contacts-client"
import { getContacts, getCustomFields } from "@/lib/actions/contacts"
import { getTags } from "@/lib/actions/tags"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

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

  const tablesExist = contacts !== null && customFields !== null && tags !== null

  if (!tablesExist || (contacts.length === 0 && customFields.length === 0 && tags.length === 0)) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-8">
        <Alert className="max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuração Necessária</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">
              As tabelas do sistema de contatos ainda não foram criadas no banco de dados. Para usar esta
              funcionalidade, você precisa executar o script SQL de configuração.
            </p>
            <p className="font-medium">
              Execute o script:{" "}
              <code className="rounded bg-slate-100 px-2 py-1">scripts/010_create_contacts_and_tags.sql</code>
            </p>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

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
