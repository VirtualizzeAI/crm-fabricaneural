"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateCard } from "@/lib/actions/cards"
import { getTags } from "@/lib/actions/tags"
import { getContacts } from "@/lib/actions/contacts"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { ManageTagsDialog } from "@/components/contacts/manage-tags-dialog"

interface EditCardDialogProps {
  card: {
    id: string
    title: string
    description: string | null
    phone: string | null
    email: string | null
    contact_id?: string | null
    tags?: Array<{ id: string; name: string; color: string }>
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditCardDialog({ card, open, onOpenChange }: EditCardDialogProps) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || "")
  const [phone, setPhone] = useState(card.phone || "")
  const [email, setEmail] = useState(card.email || "")
  const [selectedTags, setSelectedTags] = useState<string[]>(card?.tags?.map((t) => t.id) || [])
  const [selectedContactId, setSelectedContactId] = useState<string>(card.contact_id || "")
  const [isLoading, setIsLoading] = useState(false)
  const [tags, setTags] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [isManageTagsOpen, setIsManageTagsOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      loadData()
      // Reset form with card data
      setTitle(card.title)
      setDescription(card.description || "")
      setPhone(card.phone || "")
      setEmail(card.email || "")
      setSelectedTags(card?.tags?.map((t) => t.id) || [])
      setSelectedContactId(card.contact_id || "")
    }
  }, [open, card])

  const loadData = async () => {
    const [tagsData, contactsData] = await Promise.all([getTags(), getContacts()])
    setTags(tagsData)
    setContacts(contactsData)
  }

  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId)
    if (contactId === "none") {
      return
    }
    const contact = contacts.find((c) => c.id === contactId)
    if (contact) {
      setTitle(contact.name)
      setPhone(contact.phone)
      setEmail(contact.email || "")
      if (contact.tags) {
        setSelectedTags(contact?.tags?.map((t: any) => t.id))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateCard(
        card.id,
        title,
        description,
        phone,
        email,
        selectedTags,
        selectedContactId === "none" ? undefined : selectedContactId || undefined,
      )
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to update card:", error)
      alert("Failed to update card")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Editar Lead</DialogTitle>
              <DialogDescription>Atualize as informações do lead</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="contact">Contato Vinculado</Label>
                <Select value={selectedContactId || "none"} onValueChange={handleContactSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um contato..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {contacts?.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name} - {contact.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="title">Título *</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Tags</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsManageTagsOpen(true)}
                    className="h-8 text-xs"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Gerenciar Tags
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags?.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      style={
                        selectedTags.includes(tag.id)
                          ? { backgroundColor: tag.color, borderColor: tag.color }
                          : { borderColor: tag.color, color: tag.color }
                      }
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                      {selectedTags.includes(tag.id) && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800">
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ManageTagsDialog open={isManageTagsOpen} onOpenChange={setIsManageTagsOpen} onTagsUpdated={() => loadData()} />
    </>
  )
}
