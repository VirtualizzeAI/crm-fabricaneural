"use client"

import { useState, useTransition } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { LeadsChart } from "@/components/dashboard/leads-chart"
import { StatusChart } from "@/components/dashboard/status-chart"
import { RecentLeadsTable } from "@/components/dashboard/recent-leads-table"
import { DateRangeSelector } from "@/components/dashboard/date-range-selector"
import { getDashboardStats, getRecentLeads } from "@/lib/actions/dashboard"
import type { DashboardStats } from "@/lib/types"

interface DashboardClientProps {
  initialStats: DashboardStats | null
  initialLeads: any[]
  userRole: string
  userName: string
}

export function DashboardClient({ initialStats, initialLeads, userRole, userName }: DashboardClientProps) {
  const [stats, setStats] = useState(initialStats)
  const [leads, setLeads] = useState(initialLeads)
  const [selectedDays, setSelectedDays] = useState(30)
  const [isPending, startTransition] = useTransition()

  const handleRangeChange = (days: number) => {
    setSelectedDays(days)
    startTransition(async () => {
      const newStats = await getDashboardStats(days)
      const newLeads = await getRecentLeads(10)
      setStats(newStats)
      setLeads(newLeads)
    })
  }

  if (!stats) {
    return (
      <div className="flex h-screen">
        <Sidebar userRole={userRole} />
        <div className="flex-1 p-8">
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar userRole={userRole} />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-slate-200 bg-white px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
              <p className="mt-1 text-sm text-slate-600">Welcome back, {userName}</p>
            </div>
            <DateRangeSelector onRangeChange={handleRangeChange} selectedDays={selectedDays} />
          </div>
        </div>

        <div className="p-8">
          <div className="space-y-6">
            <StatsCards stats={stats} />

            <div className="grid gap-6 lg:grid-cols-2">
              <LeadsChart data={stats.leadsOverTime} />
              <StatusChart data={stats.leadsByStatus} />
            </div>

            <RecentLeadsTable leads={leads} />
          </div>
        </div>
      </div>
    </div>
  )
}
