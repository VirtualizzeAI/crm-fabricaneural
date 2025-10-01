"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { createContact } from "@/lib/actions/contacts"
import { useRouter } from "next/navigation"
import type { CustomField, Tag } from "@/lib/types"

interface CreateContactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customFields: CustomField[]
  tags: Tag[]
}

export function CreateContactDialog({ open, onOpenChange, customFields, tags }: CreateContactDialogProps) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customValues, setCustomValues] = useState<{ [key: string]: string }>({})
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const customValuesArray = Object.entries(customValues).map(([fieldId, value]) => ({
        fieldId,
        value,
      }))

      await createContact(name, phone, email || null, selectedTags, customValuesArray)
      setName("")
      setPhone("")
      setEmail("")
      setSelectedTags([])
      setCustomValues({})
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to create contact:", error)
      alert("Falha ao criar contato")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Novo Contato</DialogTitle>
            <DialogDescription>Adicione um novo contato ao seu CRM</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(11) 91234-5678"
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {tags.length > 0 && (
              <div className="grid gap-2">
                <Label>Tags</Label>
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
              </div>
            )}

            {customFields.length > 0 && (
              <div className="grid gap-3 border-t pt-4">
                <Label className="text-base">Campos Personalizados</Label>
                {customFields.map((field) => (
                  <div key={field.id} className="grid gap-2">
                    <Label htmlFor={`field-${field.id}`}>{field.name}</Label>
                    {field.field_type === "textarea" ? (
                      <Textarea
                        id={`field-${field.id}`}
                        value={customValues[field.id] || ""}
                        onChange={(e) => setCustomValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                        rows={3}
                      />
                    ) : (
                      <Input
                        id={`field-${field.id}`}
                        type={field.field_type === "number" ? "number" : field.field_type === "date" ? "date" : "text"}
                        value={customValues[field.id] || ""}
                        onChange={(e) => setCustomValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800">
              {isLoading ? "Criando..." : "Criar Contato"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
