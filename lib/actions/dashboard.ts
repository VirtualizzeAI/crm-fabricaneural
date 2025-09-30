"use server"

import { createClient } from "@/lib/supabase/server"
import type { DashboardStats } from "@/lib/types"

export async function getDashboardStats(days = 30): Promise<DashboardStats | null> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // Get user profile to check client_id
  const { data: profile } = await supabase.from("profiles").select("client_id, role").eq("id", user.id).single()

  if (!profile) return null

  // Calculate date range
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Build query based on user role
  let cardsQuery = supabase.from("cards").select("*")

  if (profile.role !== "super_admin" && profile.client_id) {
    // Regular users see only their client's cards
    const { data: boards } = await supabase.from("boards").select("id").eq("client_id", profile.client_id)

    const boardIds = boards?.map((b) => b.id) || []
    cardsQuery = cardsQuery.in("board_id", boardIds)
  }

  // Get all cards for the period
  const { data: cards } = await cardsQuery
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())

  if (!cards) {
    return {
      totalLeads: 0,
      newLeads: 0,
      contactedLeads: 0,
      qualifiedLeads: 0,
      convertedLeads: 0,
      lostLeads: 0,
      conversionRate: 0,
      leadsOverTime: [],
      leadsByStatus: [],
    }
  }

  // Calculate stats
  const totalLeads = cards.length
  const newLeads = cards.filter((c) => c.status === "new").length
  const contactedLeads = cards.filter((c) => c.status === "contacted").length
  const qualifiedLeads = cards.filter((c) => c.status === "qualified").length
  const convertedLeads = cards.filter((c) => c.status === "converted").length
  const lostLeads = cards.filter((c) => c.status === "lost").length
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0

  // Group leads by date
  const leadsOverTime: { [key: string]: number } = {}
  cards.forEach((card) => {
    const date = new Date(card.created_at).toISOString().split("T")[0]
    leadsOverTime[date] = (leadsOverTime[date] || 0) + 1
  })

  const leadsOverTimeArray = Object.entries(leadsOverTime)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Group leads by status
  const leadsByStatus = [
    { status: "New", count: newLeads },
    { status: "Contacted", count: contactedLeads },
    { status: "Qualified", count: qualifiedLeads },
    { status: "Converted", count: convertedLeads },
    { status: "Lost", count: lostLeads },
  ]

  return {
    totalLeads,
    newLeads,
    contactedLeads,
    qualifiedLeads,
    convertedLeads,
    lostLeads,
    conversionRate,
    leadsOverTime: leadsOverTimeArray,
    leadsByStatus,
  }
}

export async function getRecentLeads(limit = 10) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase.from("profiles").select("client_id, role").eq("id", user.id).single()

  if (!profile) return []

  let cardsQuery = supabase
    .from("cards")
    .select("*, stages(name)")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (profile.role !== "super_admin" && profile.client_id) {
    const { data: boards } = await supabase.from("boards").select("id").eq("client_id", profile.client_id)

    const boardIds = boards?.map((b) => b.id) || []
    cardsQuery = cardsQuery.in("board_id", boardIds)
  }

  const { data: cards } = await cardsQuery
  return cards || []
}
