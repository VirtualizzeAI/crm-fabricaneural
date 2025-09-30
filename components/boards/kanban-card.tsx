"use client"

import type React from "react"

import { useDraggable } from "@dnd-kit/core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Calendar, Trash2, Edit2 } from "lucide-react"
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
    status: string
    created_at: string
  }
}

const statusColors: { [key: string]: string } = {
  new: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  contacted:
    "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
  qualified: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800",
  converted:
    "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
  lost: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
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

    if (!confirm("Are you sure you want to delete this card?")) {
      return
    }

    try {
      await deleteCard(card.id)
      router.refresh()
    } catch (error) {
      console.error("Failed to delete card:", error)
      alert("Failed to delete card")
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
            <Badge variant="outline" className={`text-xs ${statusColors[card.status] || ""}`}>
              {card.status}
            </Badge>
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
