"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, Plus } from "lucide-react"
import { useState } from "react"
import { CreateClientDialog } from "./create-client-dialog"
import { EditClientDialog } from "./edit-client-dialog"
import { deleteClient } from "@/lib/actions/admin"
import { useRouter } from "next/navigation"

interface ClientsTableProps {
  clients: Array<{
    id: string
    name: string
    email: string
    phone: string | null
    status: string
    created_at: string
    plans: { name: string; price: number; billing_period: string } | null
  }>
  plans: Array<{
    id: string
    name: string
    price: number
    billing_period: string
  }>
}

const statusColors: { [key: string]: string } = {
  active: "bg-green-100 text-green-800 border-green-200",
  inactive: "bg-slate-100 text-slate-800 border-slate-200",
  suspended: "bg-red-100 text-red-800 border-red-200",
}

export function ClientsTable({ clients, plans }: ClientsTableProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<any>(null)
  const router = useRouter()

  const handleDelete = async (clientId: string) => {
    if (!confirm("Are you sure you want to delete this client? This will delete all associated data.")) {
      return
    }

    try {
      await deleteClient(clientId)
      router.refresh()
    } catch (error) {
      console.error("Failed to delete client:", error)
      alert("Failed to delete client")
    }
  }

  return (
    <>
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900">Clients</CardTitle>
              <CardDescription className="text-slate-600">Manage your client organizations</CardDescription>
            </div>
            <Button onClick={() => setIsCreateOpen(true)} className="bg-slate-900 hover:bg-slate-800">
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-700">Name</TableHead>
                <TableHead className="text-slate-700">Email</TableHead>
                <TableHead className="text-slate-700">Phone</TableHead>
                <TableHead className="text-slate-700">Plan</TableHead>
                <TableHead className="text-slate-700">Status</TableHead>
                <TableHead className="text-slate-700">Created</TableHead>
                <TableHead className="text-slate-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-500">
                    No clients found
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id} className="border-slate-200">
                    <TableCell className="font-medium text-slate-900">{client.name}</TableCell>
                    <TableCell className="text-slate-600">{client.email}</TableCell>
                    <TableCell className="text-slate-600">{client.phone || "N/A"}</TableCell>
                    <TableCell className="text-slate-600">
                      {client.plans ? (
                        <div className="flex flex-col">
                          <span className="font-medium">{client.plans.name}</span>
                          <span className="text-xs text-slate-500">
                            ${client.plans.price}/{client.plans.billing_period}
                          </span>
                        </div>
                      ) : (
                        "No plan"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[client.status] || ""}>
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">{new Date(client.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-600 hover:text-slate-900"
                          onClick={() => setEditingClient(client)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(client.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateClientDialog plans={plans} open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      {editingClient && (
        <EditClientDialog
          client={editingClient}
          plans={plans}
          open={!!editingClient}
          onOpenChange={(open) => !open && setEditingClient(null)}
        />
      )}
    </>
  )
}
