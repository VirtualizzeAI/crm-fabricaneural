"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Trash2 } from "lucide-react"
import { deleteContact } from "@/lib/actions/contacts"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { CustomField, Tag } from "@/lib/types"

interface ContactsTableProps {
  contacts: any[]
  customFields: CustomField[]
  tags: Tag[]
}

export function ContactsTable({ contacts, customFields, tags }: ContactsTableProps) {
  const router = useRouter()

  const handleDelete = async (contactId: string, contactName: string) => {
    if (!confirm(`Tem certeza que deseja deletar o contato "${contactName}"?`)) {
      return
    }

    try {
      await deleteContact(contactId)
      router.refresh()
    } catch (error) {
      console.error("Failed to delete contact:", error)
      alert("Falha ao deletar contato")
    }
  }

  return (
    <Card className="border-slate-200">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200">
              <TableHead className="text-slate-700">Nome</TableHead>
              <TableHead className="text-slate-700">Telefone</TableHead>
              <TableHead className="text-slate-700">Email</TableHead>
              <TableHead className="text-slate-700">Tags</TableHead>
              <TableHead className="text-slate-700">Criado em</TableHead>
              <TableHead className="text-slate-700 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                  Nenhum contato encontrado
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((contact) => (
                <TableRow key={contact.id} className="border-slate-200">
                  <TableCell className="font-medium text-slate-900">{contact.name}</TableCell>
                  <TableCell className="text-slate-600">{contact.phone}</TableCell>
                  <TableCell className="text-slate-600">{contact.email || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {contact.contact_tags?.map((ct: any) => (
                        <Badge
                          key={ct.tag_id}
                          variant="outline"
                          style={{
                            backgroundColor: `${ct.tags.color}20`,
                            borderColor: ct.tags.color,
                            color: ct.tags.color,
                          }}
                        >
                          {ct.tags.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {new Date(contact.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/contacts/${contact.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(contact.id, contact.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
