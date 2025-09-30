import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, CheckCircle2, Phone, Target } from "lucide-react"

interface StatsCardsProps {
  stats: {
    totalLeads: number
    newLeads: number
    contactedLeads: number
    qualifiedLeads: number
    convertedLeads: number
    lostLeads: number
    conversionRate: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total de Leads",
      value: stats.totalLeads,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Novos Leads",
      value: stats.newLeads,
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Contatados",
      value: stats.contactedLeads,
      icon: Phone,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Qualificados",
      value: stats.qualifiedLeads,
      icon: TrendingUp,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
    },
    {
      title: "Convertidos",
      value: stats.convertedLeads,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Taxa de Conversão",
      value: `${stats.conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
