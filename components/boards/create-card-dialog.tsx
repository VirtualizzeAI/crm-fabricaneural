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
import { createCard } from "@/lib/actions/cards"
import { getTags } from "@/lib/actions/tags"
import { getContacts } from "@/lib/actions/contacts"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { ManageTagsDialog } from "@/components/contacts/manage-tags-dialog"

interface CreateCardDialogProps {
  boardId: string
  stageId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCardDialog({ boardId, stageId, open, onOpenChange }: CreateCardDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedContactId, setSelectedContactId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [tags, setTags] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [isManageTagsOpen, setIsManageTagsOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  const loadData = async () => {
    const [tagsData, contactsData] = await Promise.all([getTags(), getContacts()])
    setTags(tagsData)
    setContacts(contactsData)
  }

  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId)
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
      await createCard(boardId, stageId, title, description, phone, email, selectedTags, selectedContactId || undefined)
      setTitle("")
      setDescription("")
      setPhone("")
      setEmail("")
      setSelectedTags([])
      setSelectedContactId("")
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to create card:", error)
      alert("Failed to create card")
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
              <DialogTitle>Criar Novo Lead</DialogTitle>
              <DialogDescription>Adicione um novo card de lead a esta etapa</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="contact">Contato Existente (Opcional)</Label>
                <Select value={selectedContactId} onValueChange={handleContactSelect}>
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
                <Input
                  id="title"
                  placeholder="Nome do lead ou empresa"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Notas adicionais..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="11 91234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
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
                {isLoading ? "Criando..." : "Criar Lead"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ManageTagsDialog open={isManageTagsOpen} onOpenChange={setIsManageTagsOpen} onTagsUpdated={() => loadData()} />
    </>
  )
}
