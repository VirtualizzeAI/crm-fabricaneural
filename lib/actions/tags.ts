"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getTags() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase.from("profiles").select("client_id, role").eq("id", user.id).single()

    if (!profile || !profile.client_id) return []

    const { data: tags, error } = await supabase
      .from("tags")
      .select("*")
      .eq("client_id", profile.client_id)
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching tags:", error)
      return []
    }

    return tags || []
  } catch (error) {
    console.error("Error in getTags:", error)
    return []
  }
}

export async function createTag(name: string, color: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("client_id").eq("id", user.id).single()

  if (!profile || !profile.client_id) throw new Error("Profile not found")

  const { data: tag, error } = await supabase
    .from("tags")
    .insert({
      name,
      color,
      client_id: profile.client_id,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath("/")
  return tag
}

export async function deleteTag(tagId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("tags").delete().eq("id", tagId)

  if (error) throw error

  revalidatePath("/")
}
