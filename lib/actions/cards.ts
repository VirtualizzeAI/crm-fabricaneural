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
  tagIds: string[],
  contactId?: string,
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
      contact_id: contactId || null,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) throw error

  if (tagIds.length > 0) {
    const cardTags = tagIds.map((tagId) => ({
      card_id: card.id,
      tag_id: tagId,
    }))
    await supabase.from("card_tags").insert(cardTags)
  }

  revalidatePath(`/boards/${boardId}`)
  return card
}

export async function updateCard(
  cardId: string,
  title: string,
  description: string,
  phone: string,
  email: string,
  tagIds: string[],
  contactId?: string,
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("cards")
    .update({ title, description, phone, email, contact_id: contactId || null })
    .eq("id", cardId)

  if (error) throw error

  await supabase.from("card_tags").delete().eq("card_id", cardId)

  if (tagIds.length > 0) {
    const cardTags = tagIds.map((tagId) => ({
      card_id: cardId,
      tag_id: tagId,
    }))
    await supabase.from("card_tags").insert(cardTags)
  }

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

  const { data: card } = await supabase.from("cards").select("board_id").eq("id", cardId).single()

  const { error } = await supabase
    .from("cards")
    .update({ stage_id: newStageId, position: newPosition })
    .eq("id", cardId)

  if (error) throw error

  if (card) {
    revalidatePath(`/boards/${card.board_id}`)
  }
  revalidatePath("/boards")
}

export async function getCardsWithTags(boardId: string) {
  const supabase = await createClient()

  const { data: cards, error } = await supabase
    .from("cards")
    .select(
      `
      *,
      card_tags(
        tag_id,
        tags(*)
      ),
      contacts(*)
    `,
    )
    .eq("board_id", boardId)

  if (error) throw error

  return cards?.map((card) => ({
    ...card,
    tags: card.card_tags?.map((ct: any) => ct.tags) || [],
    contact: card.contacts || null,
  }))
}
