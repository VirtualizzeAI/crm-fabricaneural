import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, Kanban, Target, CheckCircle2 } from "lucide-react"

interface AdminStatsProps {
  stats: {
    activeClients: number
    totalClients: number
    totalUsers: number
    totalBoards: number
    totalLeads: number
  }
}

export function AdminStats({ stats }: AdminStatsProps) {
  const cards = [
    {
      title: "Active Clients",
      value: stats.activeClients,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Clients",
      value: stats.totalClients,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Boards",
      value: stats.totalBoards,
      icon: Kanban,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
    },
    {
      title: "Total Leads",
      value: stats.totalLeads,
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">{card.title}</CardTitle>
              <div className={`rounded-full p-2 ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{card.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
