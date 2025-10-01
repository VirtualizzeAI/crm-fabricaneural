"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import { createTag, deleteTag } from "@/lib/actions/tags"
import { useRouter } from "next/navigation"
import type { Tag } from "@/lib/types"

interface ManageTagsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tags: Tag[]
}

const defaultColors = [
  "#a855f7", // purple
  "#f97316", // orange
  "#06b6d4", // cyan
  "#22c55e", // green
  "#ef4444", // red
  "#3b82f6", // blue
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#8b5cf6", // violet
]

export function ManageTagsDialog({ open, onOpenChange, tags }: ManageTagsDialogProps) {
  const [name, setName] = useState("")
  const [color, setColor] = useState(defaultColors[0])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await createTag(name, color)
      setName("")
      setColor(defaultColors[0])
      router.refresh()
    } catch (error) {
      console.error("Failed to create tag:", error)
      alert("Falha ao criar tag")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (tagId: string, tagName: string) => {
    if (!confirm(`Tem certeza que deseja deletar a tag "${tagName}"?`)) {
      return
    }

    try {
      await deleteTag(tagId)
      router.refresh()
    } catch (error) {
      console.error("Failed to delete tag:", error)
      alert("Falha ao deletar tag")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Tags</DialogTitle>
          <DialogDescription>Crie e gerencie tags para organizar seus contatos e cards</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="tag-name">Nome da Tag</Label>
            <Input
              id="tag-name"
              placeholder="Ex: Cliente VIP, Urgente, Follow-up..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label>Cor da Tag</Label>
            <div className="flex flex-wrap gap-2">
              {defaultColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`h-8 w-8 rounded-full border-2 ${color === c ? "border-slate-900 scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            {isLoading ? "Criando..." : "Adicionar Tag"}
          </Button>
        </form>

        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-medium mb-3">Tags Existentes</h4>
          {tags.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma tag criada</p>
          ) : (
            <div className="space-y-2">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: tag.color }} />
                    <p className="text-sm font-medium">{tag.name}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(tag.id, tag.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
