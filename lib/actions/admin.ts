"use server"

import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getAllClients() {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "super_admin") {
    throw new Error("Unauthorized")
  }

  const { data: clients } = await supabase
    .from("clients")
    .select("*, plans(name, price, billing_period)")
    .order("created_at", { ascending: false })

  return clients || []
}

export async function createClient(name: string, email: string, phone: string, planId: string, status: string) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "super_admin") {
    throw new Error("Unauthorized")
  }

  const { data: client, error } = await supabase
    .from("clients")
    .insert({
      name,
      email,
      phone,
      plan_id: planId,
      status,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath("/super-admin")
  return client
}

export async function updateClient(
  clientId: string,
  name: string,
  email: string,
  phone: string,
  planId: string,
  status: string,
) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "super_admin") {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("clients")
    .update({
      name,
      email,
      phone,
      plan_id: planId,
      status,
    })
    .eq("id", clientId)

  if (error) throw error

  revalidatePath("/super-admin")
}

export async function deleteClient(clientId: string) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "super_admin") {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase.from("clients").delete().eq("id", clientId)

  if (error) throw error

  revalidatePath("/super-admin")
}

export async function getAllPlans() {
  const supabase = await createSupabaseClient()

  const { data: plans } = await supabase.from("plans").select("*").order("price", { ascending: true })

  return plans || []
}

export async function createPlan(
  name: string,
  description: string,
  price: number,
  billingPeriod: string,
  maxBoards: number,
  maxUsers: number,
  features: Record<string, boolean>,
) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "super_admin") {
    throw new Error("Unauthorized")
  }

  const { data: plan, error } = await supabase
    .from("plans")
    .insert({
      name,
      description,
      price,
      billing_period: billingPeriod,
      max_boards: maxBoards,
      max_users: maxUsers,
      features,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath("/super-admin")
  return plan
}

export async function updatePlan(
  planId: string,
  name: string,
  description: string,
  price: number,
  billingPeriod: string,
  maxBoards: number,
  maxUsers: number,
  features: Record<string, boolean>,
) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "super_admin") {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("plans")
    .update({
      name,
      description,
      price,
      billing_period: billingPeriod,
      max_boards: maxBoards,
      max_users: maxUsers,
      features,
    })
    .eq("id", planId)

  if (error) throw error

  revalidatePath("/super-admin")
}

export async function deletePlan(planId: string) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "super_admin") {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase.from("plans").delete().eq("id", planId)

  if (error) throw error

  revalidatePath("/super-admin")
}

export async function getAdminStats() {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "super_admin") {
    throw new Error("Unauthorized")
  }

  const { data: clients } = await supabase.from("clients").select("status")
  const { data: profiles } = await supabase.from("profiles").select("id")
  const { data: boards } = await supabase.from("boards").select("id")
  const { data: cards } = await supabase.from("cards").select("id")

  const activeClients = clients?.filter((c) => c.status === "active").length || 0
  const totalClients = clients?.length || 0
  const totalUsers = profiles?.length || 0
  const totalBoards = boards?.length || 0
  const totalLeads = cards?.length || 0

  return {
    activeClients,
    totalClients,
    totalUsers,
    totalBoards,
    totalLeads,
  }
}
