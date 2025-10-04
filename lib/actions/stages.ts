"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getStagesWithCards(boardId: string) {
  const supabase = await createClient()

  const { data: stages } = await supabase
    .from("stages")
    .select("*, cards(*)")
    .eq("board_id", boardId)
    .order("position", { ascending: true })

  if (!stages) return []

  // Sort cards by position within each stage
  return stages?.map((stage) => ({
    ...stage,
    cards: (stage.cards || []).sort((a: any, b: any) => a.position - b.position),
  }))
}

export async function createStage(boardId: string, name: string, color: string) {
  const supabase = await createClient()

  // Get the highest position
  const { data: stages } = await supabase
    .from("stages")
    .select("position")
    .eq("board_id", boardId)
    .order("position", { ascending: false })
    .limit(1)

  const nextPosition = stages && stages?.length > 0 ? stages[0].position + 1 : 0

  const { data: stage, error } = await supabase
    .from("stages")
    .insert({
      name,
      board_id: boardId,
      position: nextPosition,
      color,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath(`/boards/${boardId}`)
  return stage
}

export async function updateStage(stageId: string, name: string, color: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("stages").update({ name, color }).eq("id", stageId)

  if (error) throw error

  revalidatePath("/boards")
}

export async function deleteStage(stageId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("stages").delete().eq("id", stageId)

  if (error) throw error

  revalidatePath("/boards")
}
