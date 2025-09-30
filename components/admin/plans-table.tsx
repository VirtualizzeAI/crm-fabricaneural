"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, Plus, Check, X } from "lucide-react"
import { useState } from "react"
import { CreatePlanDialog } from "./create-plan-dialog"
import { EditPlanDialog } from "./edit-plan-dialog"
import { deletePlan } from "@/lib/actions/admin"
import { useRouter } from "next/navigation"

interface PlansTableProps {
  plans: Array<{
    id: string
    name: string
    description: string | null
    price: number
    billing_period: string
    max_boards: number
    max_users: number
    features: Record<string, boolean>
    created_at: string
  }>
}

export function PlansTable({ plans }: PlansTableProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any>(null)
  const router = useRouter()

  const handleDelete = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this plan? Clients using this plan will need to be reassigned.")) {
      return
    }

    try {
      await deletePlan(planId)
      router.refresh()
    } catch (error) {
      console.error("Failed to delete plan:", error)
      alert("Failed to delete plan")
    }
  }

  return (
    <>
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900">Plans</CardTitle>
              <CardDescription className="text-slate-600">Manage subscription plans and pricing</CardDescription>
            </div>
            <Button onClick={() => setIsCreateOpen(true)} className="bg-slate-900 hover:bg-slate-800">
              <Plus className="mr-2 h-4 w-4" />
              Add Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-700">Name</TableHead>
                <TableHead className="text-slate-700">Price</TableHead>
                <TableHead className="text-slate-700">Limits</TableHead>
                <TableHead className="text-slate-700">Features</TableHead>
                <TableHead className="text-slate-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500">
                    No plans found
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan.id} className="border-slate-200">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{plan.name}</span>
                        <span className="text-sm text-slate-600">{plan.description}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-900">
                      <div className="flex flex-col">
                        <span className="font-semibold">${plan.price}</span>
                        <span className="text-xs text-slate-500">per {plan.billing_period}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      <div className="flex flex-col gap-1 text-sm">
                        <span>{plan.max_boards} boards</span>
                        <span>{plan.max_users} users</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(plan.features).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center gap-1 text-xs text-slate-600"
                            title={key.replace(/_/g, " ")}
                          >
                            {value ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <X className="h-3 w-3 text-red-600" />
                            )}
                            <span className="capitalize">{key.replace(/_/g, " ")}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-600 hover:text-slate-900"
                          onClick={() => setEditingPlan(plan)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(plan.id)}
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

      <CreatePlanDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      {editingPlan && (
        <EditPlanDialog
          plan={editingPlan}
          open={!!editingPlan}
          onOpenChange={(open) => !open && setEditingPlan(null)}
        />
      )}
    </>
  )
}
