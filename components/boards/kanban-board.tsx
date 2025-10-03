"use client"

import { useState } from "react"
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { KanbanColumn } from "./kanban-column"
import { KanbanCard } from "./kanban-card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateStageDialog } from "./create-stage-dialog"
import { moveCard } from "@/lib/actions/cards"
import { useRouter } from "next/navigation"

interface KanbanBoardProps {
  boardId: string
  stages: Array<{
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
  }>
}

export function KanbanBoard({ boardId, stages }: KanbanBoardProps) {
  const [activeCard, setActiveCard] = useState<any>(null)
  const [isCreateStageOpen, setIsCreateStageOpen] = useState(false)
  const router = useRouter()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const card = stages?.flatMap((stage) => stage.cards).find((card) => card.id === active.id)
    setActiveCard(card)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)

    if (!over) return

    const cardId = active.id as string
    const overId = over.id as string

    // Find the target stage
    const targetStage = stages.find((stage) => stage.id === overId || stage.cards.some((card) => card.id === overId))

    if (!targetStage) return

    // Find the card being dragged
    const sourceStage = stages.find((stage) => stage.cards.some((card) => card.id === cardId))

    if (!sourceStage) return

    // If dropped on the same stage, do nothing
    if (sourceStage.id === targetStage.id && overId === targetStage.id) return

    // Calculate new position
    let newPosition = 0
    if (overId === targetStage.id) {
      // Dropped on stage header, put at the end
      newPosition = targetStage?.cards?.length
    } else {
      // Dropped on a card, insert before it
      const overCardIndex = targetStage.cards.findIndex((card) => card.id === overId)
      newPosition = overCardIndex >= 0 ? overCardIndex : targetStage?.cards?.length
    }

    try {
      await moveCard(cardId, targetStage.id, newPosition)
      router.refresh()
    } catch (error) {
      console.error("Failed to move card:", error)
    }
  }

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages?.map((stage) => (
            <KanbanColumn key={stage.id} stage={stage} boardId={boardId} />
          ))}

          <div className="flex-shrink-0">
            <Button
              variant="outline"
              className="h-full min-h-[200px] w-[300px] border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 bg-transparent"
              onClick={() => setIsCreateStageOpen(true)}
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Stage
            </Button>
          </div>
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className="rotate-3 opacity-80">
              <KanbanCard card={activeCard} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CreateStageDialog boardId={boardId} open={isCreateStageOpen} onOpenChange={setIsCreateStageOpen} />
    </>
  )
}
