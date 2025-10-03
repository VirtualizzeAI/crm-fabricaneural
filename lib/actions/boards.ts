"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getBoards() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase.from("profiles").select("client_id, role").eq("id", user.id).single()

  if (!profile) return []

  let query = supabase.from("boards").select("*").order("created_at", { ascending: false })

  if (profile.role !== "super_admin" && profile.client_id) {
    query = query.eq("client_id", profile.client_id)
  }

  const { data: boards } = await query
  return boards || []
}

export async function createBoard(name: string, description: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  console.log("[v0] Creating board for user:", user.id)

  const { data: profile } = await supabase
    .from("profiles")
    .select("client_id, email, full_name")
    .eq("id", user.id)
    .single()

  if (!profile) throw new Error("Profile not found")

  console.log("[v0] User profile:", profile)

  let clientId = profile.client_id

  if (!clientId) {
    console.log("[v0] No client_id found, creating organization...")
    const organizationName = profile.full_name || profile.email.split("@")[0] + "'s Organization"

    // Call the secure database function to create the organization
    const { data: newClientId, error: clientError } = await supabase.rpc("create_user_organization", {
      organization_name: organizationName,
    })

    console.log("[v0] RPC result:", { newClientId, clientError })

    if (clientError) {
      console.error("[v0] Failed to create organization:", clientError)
      throw new Error(`Failed to create organization: ${clientError.message}`)
    }

    if (!newClientId) {
      console.error("[v0] No client ID returned from RPC")
      throw new Error("Failed to create organization: No client ID returned")
    }

    clientId = newClientId
    console.log("[v0] Organization created with ID:", clientId)
  }

  console.log("[v0] Creating board with client_id:", clientId)

  const { data: board, error } = await supabase
    .from("boards")
    .insert({
      name,
      description,
      client_id: clientId,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Failed to create board:", error)
    throw error
  }

  console.log("[v0] Board created:", board)

  // Create default stages
  const defaultStages = [
    { name: "New", position: 0, color: "#a855f7" },
    { name: "Contacted", position: 1, color: "#f97316" },
    { name: "Qualified", position: 2, color: "#06b6d4" },
    { name: "Converted", position: 3, color: "#22c55e" },
  ]

  const { error: stagesError } = await supabase.from("stages").insert(
    defaultStages?.map((stage) => ({
      ...stage,
      board_id: board.id,
    })),
  )

  if (stagesError) {
    console.error("[v0] Failed to create stages:", stagesError)
  }

  revalidatePath("/boards")
  return board
}

export async function deleteBoard(boardId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("boards").delete().eq("id", boardId)

  if (error) throw error

  revalidatePath("/boards")
}
