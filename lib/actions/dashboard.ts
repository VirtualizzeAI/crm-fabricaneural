"use server"

import { createClient } from "@/lib/supabase/server"
import type { DashboardStats } from "@/lib/types"

export async function getDashboardStats(days = 30): Promise<DashboardStats | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("client_id, role").eq("id", user.id).single()

  if (!profile) return null

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  let cardsQuery = supabase.from("cards").select(`
    *,
    card_tags(
      tags(*)
    )
  `)

  if (profile.role !== "super_admin" && profile.client_id) {
    const { data: boards } = await supabase.from("boards").select("id").eq("client_id", profile.client_id)
    const boardIds = boards?.map((b) => b.id) || []
    cardsQuery = cardsQuery.in("board_id", boardIds)
  }

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
      leadsByTags: [],
      customFieldStats: [],
    }
  }

  const totalLeads = cards.length

  // Count leads by tag name (case-insensitive)
  const getLeadCountByTag = (tagName: string) => {
    return cards.filter((c: any) =>
      c.card_tags?.some((ct: any) => ct.tags?.name?.toLowerCase() === tagName.toLowerCase()),
    ).length
  }

  const newLeads = getLeadCountByTag("novo")
  const contactedLeads = getLeadCountByTag("contatado")
  const qualifiedLeads = getLeadCountByTag("qualificado")
  const convertedLeads = getLeadCountByTag("convertido")
  const lostLeads = getLeadCountByTag("perdido")
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

  const tagCounts: { [key: string]: { count: number; color: string } } = {}
  cards.forEach((card: any) => {
    card.card_tags?.forEach((ct: any) => {
      if (ct.tags) {
        const tagName = ct.tags.name
        if (!tagCounts[tagName]) {
          tagCounts[tagName] = { count: 0, color: ct.tags.color }
        }
        tagCounts[tagName].count++
      }
    })
  })

  const leadsByTags = Object.entries(tagCounts).map(([tag, data]) => ({
    tag,
    count: data.count,
    color: data.color,
  }))

  const { data: customFieldStats } = await supabase.from("contact_custom_values").select(`
      value,
      custom_fields(name)
    `)

  const customFieldStatsMap: { [key: string]: { [value: string]: number } } = {}
  customFieldStats?.forEach((stat: any) => {
    const fieldName = stat.custom_fields?.name
    if (fieldName && stat.value) {
      if (!customFieldStatsMap[fieldName]) {
        customFieldStatsMap[fieldName] = {}
      }
      customFieldStatsMap[fieldName][stat.value] = (customFieldStatsMap[fieldName][stat.value] || 0) + 1
    }
  })

  const customFieldStatsArray = Object.entries(customFieldStatsMap).map(([fieldName, values]) => ({
    fieldName,
    values: Object.entries(values).map(([value, count]) => ({ value, count })),
  }))

  return {
    totalLeads,
    newLeads,
    contactedLeads,
    qualifiedLeads,
    convertedLeads,
    lostLeads,
    conversionRate,
    leadsOverTime: leadsOverTimeArray,
    leadsByTags,
    customFieldStats: customFieldStatsArray,
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
