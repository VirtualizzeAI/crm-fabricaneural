"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Edit2, Save, X } from "lucide-react"
import { updateContact } from "@/lib/actions/contacts"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { CustomField, Tag } from "@/lib/types"

interface ContactProfileClientProps {
  contact: any
  customFields: CustomField[]
  tags: Tag[]
  userRole: string
  userName: string
}

export function ContactProfileClient({ contact, customFields, tags, userRole, userName }: ContactProfileClientProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(contact.name)
  const [phone, setPhone] = useState(contact.phone)
  const [email, setEmail] = useState(contact.email || "")
  const [selectedTags, setSelectedTags] = useState<string[]>(contact.contact_tags?.map((ct: any) => ct.tag_id) || [])
  const [customValues, setCustomValues] = useState<{ [key: string]: string }>(() => {
    const values: { [key: string]: string } = {}
    contact.contact_custom_values?.forEach((cv: any) => {
      values[cv.custom_field_id] = cv.value || ""
    })
    return values
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const formatPhoneBrazilian = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneBrazilian(e.target.value)
    setPhone(formatted)
  }

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      const customValuesArray = Object.entries(customValues).map(([fieldId, value]) => ({
        fieldId,
        value,
      }))

      await updateContact(contact.id, name, phone, email || null, selectedTags, customValuesArray)
      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to update contact:", error)
      alert("Falha ao atualizar contato")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setName(contact.name)
    setPhone(contact.phone)
    setEmail(contact.email || "")
    setSelectedTags(contact.contact_tags?.map((ct: any) => ct.tag_id) || [])
    const values: { [key: string]: string } = {}
    contact.contact_custom_values?.forEach((cv: any) => {
      values[cv.custom_field_id] = cv.value || ""
    })
    setCustomValues(values)
    setIsEditing(false)
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar userRole={userRole} />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-slate-200 bg-white px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/contacts">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{contact.name}</h1>
                <p className="mt-1 text-sm text-slate-600">Perfil do Contato</p>
              </div>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={isLoading} className="bg-slate-900 hover:bg-slate-800">
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? "Salvando..." : "Salvar"}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="bg-slate-900 hover:bg-slate-800">
                  <Edit2 className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 max-w-4xl">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Informações do Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome *</Label>
                  {isEditing ? (
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  ) : (
                    <p className="text-slate-900">{contact.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    {isEditing ? (
                      <Input id="phone" type="tel" value={phone} onChange={handlePhoneChange} required />
                    ) : (
                      <p className="text-slate-900">{contact.phone}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    ) : (
                      <p className="text-slate-900">{contact.email || "-"}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Tags</Label>
                  {isEditing ? (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <div key={tag.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag.id}`}
                            checked={selectedTags.includes(tag.id)}
                            onCheckedChange={() => handleTagToggle(tag.id)}
                          />
                          <label
                            htmlFor={`tag-${tag.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            <span
                              className="inline-block px-2 py-1 rounded text-xs"
                              style={{
                                backgroundColor: `${tag.color}20`,
                                borderColor: tag.color,
                                color: tag.color,
                                border: "1px solid",
                              }}
                            >
                              {tag.name}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {contact.contact_tags?.length > 0 ? (
                        contact.contact_tags.map((ct: any) => (
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
                        ))
                      ) : (
                        <p className="text-slate-500 text-sm">Nenhuma tag</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {customFields.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Campos Personalizados</h3>
                  <div className="grid gap-4">
                    {customFields.map((field) => {
                      const existingValue = contact.contact_custom_values?.find(
                        (cv: any) => cv.custom_field_id === field.id,
                      )
                      return (
                        <div key={field.id} className="grid gap-2">
                          <Label htmlFor={`field-${field.id}`}>{field.name}</Label>
                          {isEditing ? (
                            field.field_type === "textarea" ? (
                              <Textarea
                                id={`field-${field.id}`}
                                value={customValues[field.id] || ""}
                                onChange={(e) => setCustomValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                                rows={3}
                              />
                            ) : (
                              <Input
                                id={`field-${field.id}`}
                                type={
                                  field.field_type === "number"
                                    ? "number"
                                    : field.field_type === "date"
                                      ? "date"
                                      : "text"
                                }
                                value={customValues[field.id] || ""}
                                onChange={(e) => setCustomValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                              />
                            )
                          ) : (
                            <p className="text-slate-900">{existingValue?.value || "-"}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="border-t pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Criado em</p>
                    <p className="text-slate-900 font-medium">{new Date(contact.created_at).toLocaleString("pt-BR")}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Atualizado em</p>
                    <p className="text-slate-900 font-medium">{new Date(contact.updated_at).toLocaleString("pt-BR")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
