"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ContactsTable } from "@/components/contacts/contacts-table"
import { CreateContactDialog } from "@/components/contacts/create-contact-dialog"
import { ManageCustomFieldsDialog } from "@/components/contacts/manage-custom-fields-dialog"
import { ManageTagsDialog } from "@/components/contacts/manage-tags-dialog"
import type { CustomField, Tag } from "@/lib/types"

interface ContactsClientProps {
  initialContacts: any[]
  customFields: CustomField[]
  tags: Tag[]
  userRole: string
  userName: string
}

export function ContactsClient({ initialContacts, customFields, tags, userRole, userName }: ContactsClientProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isFieldsOpen, setIsFieldsOpen] = useState(false)
  const [isTagsOpen, setIsTagsOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar userRole={userRole} />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-slate-200 bg-white px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Contatos</h1>
              <p className="mt-1 text-sm text-slate-600">Gerencie seus contatos e leads</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsTagsOpen(true)}>
                Gerenciar Tags
              </Button>
              <Button variant="outline" onClick={() => setIsFieldsOpen(true)}>
                Campos Personalizados
              </Button>
              <Button onClick={() => setIsCreateOpen(true)} className="bg-slate-900 hover:bg-slate-800">
                <Plus className="mr-2 h-4 w-4" />
                Novo Contato
              </Button>
            </div>
          </div>
        </div>

        <div className="p-8">
          <ContactsTable contacts={initialContacts} customFields={customFields} tags={tags} />
        </div>
      </div>

      <CreateContactDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} customFields={customFields} tags={tags} />

      <ManageCustomFieldsDialog open={isFieldsOpen} onOpenChange={setIsFieldsOpen} customFields={customFields} />

      <ManageTagsDialog open={isTagsOpen} onOpenChange={setIsTagsOpen} tags={tags} />
    </div>
  )
}
