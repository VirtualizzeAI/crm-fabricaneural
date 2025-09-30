"use client"

import { useDroppable } from "@dnd-kit/core"
import { KanbanCard } from "./kanban-card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Edit2 } from "lucide-react"
import { useState } from "react"
import { CreateCardDialog } from "./create-card-dialog"
import { EditStageDialog } from "./edit-stage-dialog"
import { deleteStage } from "@/lib/actions/stages"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

interface KanbanColumnProps {
  stage: {
    id: string
    name: string
    position: number
    color: string | null
    cards: Array<{
      id: string
      title: string
      description: string | null
      phone: string | null
      email: string | null
      status: string
      created_at: string
    }>
  }
  boardId: string
}

export function KanbanColumn({ stage, boardId }: KanbanColumnProps) {
  const [isCreateCardOpen, setIsCreateCardOpen] = useState(false)
  const [isEditStageOpen, setIsEditStageOpen] = useState(false)
  const router = useRouter()
  const { setNodeRef } = useDroppable({
    id: stage.id,
  })

  const handleDeleteStage = async () => {
    if (
      !confirm(`Are you sure you want to delete the "${stage.name}" stage? All cards in this stage will be deleted.`)
    ) {
      return
    }

    try {
      await deleteStage(stage.id)
      router.refresh()
    } catch (error) {
      console.error("Failed to delete stage:", error)
      alert("Failed to delete stage")
    }
  }

  return (
    <>
      <div ref={setNodeRef} className="flex-shrink-0 w-full sm:w-[280px] md:w-[320px]">
        <div className="rounded-lg border border-border bg-card p-3 md:p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {stage.color && <div className="h-3 w-3 rounded-full" style={{ backgroundColor: stage.color }} />}
              <h3 className="font-semibold text-card-foreground text-sm md:text-base">{stage.name}</h3>
              <Badge variant="secondary">{stage.cards.length}</Badge>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 md:h-8 md:w-8"
                onClick={() => setIsEditStageOpen(true)}
              >
                <Edit2 className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 md:h-8 md:w-8 text-destructive hover:bg-destructive/10"
                onClick={handleDeleteStage}
              >
                <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3 min-h-[300px] md:min-h-[400px]">
            {stage.cards.map((card) => (
              <KanbanCard key={card.id} card={card} />
            ))}
          </div>

          <Button variant="outline" className="mt-3 w-full bg-transparent" onClick={() => setIsCreateCardOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Card
          </Button>
        </div>
      </div>

      <CreateCardDialog
        boardId={boardId}
        stageId={stage.id}
        open={isCreateCardOpen}
        onOpenChange={setIsCreateCardOpen}
      />

      <EditStageDialog stage={stage} open={isEditStageOpen} onOpenChange={setIsEditStageOpen} />
    </>
  )
}
