"use client"

import type React from "react"

import { useDraggable } from "@dnd-kit/core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Calendar, Trash2, Edit2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { EditCardDialog } from "./edit-card-dialog"
import { deleteCard } from "@/lib/actions/cards"
import { useRouter } from "next/navigation"

interface KanbanCardProps {
  card: {
    id: string
    title: string
    description: string | null
    phone: string | null
    email: string | null
    created_at: string
    tags?: Array<{ id: string; name: string; color: string }>
    contact?: { id: string; name: string } | null
  }
}

export function KanbanCard({ card }: KanbanCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const router = useRouter()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm("Tem certeza que deseja deletar este card?")) {
      return
    }

    try {
      await deleteCard(card.id)
      router.refresh()
    } catch (error) {
      console.error("Failed to delete card:", error)
      alert("Falha ao deletar card")
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditOpen(true)
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing border-border bg-card hover:shadow-md transition-shadow group"
      >
        <CardHeader className="pb-3 p-3 md:p-4">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-xs md:text-sm font-semibold text-card-foreground line-clamp-2">
              {card.title}
            </CardTitle>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleEdit}>
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {card.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{card.description}</p>}
        </CardHeader>
        <CardContent className="space-y-2 p-3 md:p-4 pt-0">
          {card.contact && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-slate-50 p-2 rounded">
              <User className="h-3 w-3 flex-shrink-0" />
              <span className="truncate font-medium">{card.contact.name}</span>
            </div>
          )}
          {card.email && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{card.email}</span>
            </div>
          )}
          {card.phone && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3 w-3 flex-shrink-0" />
              <span>{card.phone}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
            <div className="flex flex-wrap gap-1">
              {card.tags?.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-xs"
                  style={{ backgroundColor: tag.color + "20", borderColor: tag.color, color: tag.color }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span className="hidden sm:inline">{new Date(card.created_at).toLocaleDateString()}</span>
              <span className="sm:hidden">
                {new Date(card.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditCardDialog card={card} open={isEditOpen} onOpenChange={setIsEditOpen} />
    </>
  )
}
