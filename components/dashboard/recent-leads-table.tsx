import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RecentLeadsTableProps {
  leads: Array<{
    id: string
    title: string
    email: string | null
    phone: string | null
    status: string
    created_at: string
    stages: { name: string } | null
  }>
}

const statusColors: { [key: string]: string } = {
  new: "bg-purple-100 text-purple-800 border-purple-200",
  contacted: "bg-orange-100 text-orange-800 border-orange-200",
  qualified: "bg-cyan-100 text-cyan-800 border-cyan-200",
  converted: "bg-green-100 text-green-800 border-green-200",
  lost: "bg-red-100 text-red-800 border-red-200",
}

export function RecentLeadsTable({ leads }: RecentLeadsTableProps) {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-slate-900">Recent Leads</CardTitle>
        <CardDescription className="text-slate-600">Latest leads added to your pipeline</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200">
              <TableHead className="text-slate-700">Title</TableHead>
              <TableHead className="text-slate-700">Contact</TableHead>
              <TableHead className="text-slate-700">Stage</TableHead>
              <TableHead className="text-slate-700">Status</TableHead>
              <TableHead className="text-slate-700">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500">
                  No leads found
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id} className="border-slate-200">
                  <TableCell className="font-medium text-slate-900">{lead.title}</TableCell>
                  <TableCell className="text-slate-600">
                    <div className="flex flex-col gap-1">
                      {lead.email && <span className="text-sm">{lead.email}</span>}
                      {lead.phone && <span className="text-sm text-slate-500">{lead.phone}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{lead.stages?.name || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[lead.status] || ""}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
