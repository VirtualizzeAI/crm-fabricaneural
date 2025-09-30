"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createCard(
  boardId: string,
  stageId: string,
  title: string,
  description: string,
  phone: string,
  email: string,
  status: string,
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Get the highest position in the stage
  const { data: cards } = await supabase
    .from("cards")
    .select("position")
    .eq("stage_id", stageId)
    .order("position", { ascending: false })
    .limit(1)

  const nextPosition = cards && cards.length > 0 ? cards[0].position + 1 : 0

  const { data: card, error } = await supabase
    .from("cards")
    .insert({
      title,
      description,
      board_id: boardId,
      stage_id: stageId,
      position: nextPosition,
      phone,
      email,
      status,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath(`/boards/${boardId}`)
  return card
}

export async function updateCard(
  cardId: string,
  title: string,
  description: string,
  phone: string,
  email: string,
  status: string,
) {
  const supabase = await createClient()

  const { error } = await supabase.from("cards").update({ title, description, phone, email, status }).eq("id", cardId)

  if (error) throw error

  revalidatePath("/boards")
}

export async function deleteCard(cardId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("cards").delete().eq("id", cardId)

  if (error) throw error

  revalidatePath("/boards")
}

export async function moveCard(cardId: string, newStageId: string, newPosition: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("cards")
    .update({ stage_id: newStageId, position: newPosition })
    .eq("id", cardId)

  if (error) throw error

  revalidatePath("/boards")
}
