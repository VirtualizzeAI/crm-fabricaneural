"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { updatePlan } from "@/lib/actions/admin"
import { useRouter } from "next/navigation"

interface EditPlanDialogProps {
  plan: {
    id: string
    name: string
    description: string | null
    price: number
    billing_period: string
    max_boards: number
    max_users: number
    features: Record<string, boolean>
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditPlanDialog({ plan, open, onOpenChange }: EditPlanDialogProps) {
  const [name, setName] = useState(plan.name)
  const [description, setDescription] = useState(plan.description || "")
  const [price, setPrice] = useState(plan.price.toString())
  const [billingPeriod, setBillingPeriod] = useState(plan.billing_period)
  const [maxBoards, setMaxBoards] = useState(plan.max_boards.toString())
  const [maxUsers, setMaxUsers] = useState(plan.max_users.toString())
  const [features, setFeatures] = useState(plan.features)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updatePlan(
        plan.id,
        name,
        description,
        Number.parseFloat(price),
        billingPeriod,
        Number.parseInt(maxBoards),
        Number.parseInt(maxUsers),
        features,
      )
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to update plan:", error)
      alert("Failed to update plan")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Plan</DialogTitle>
            <DialogDescription>Update plan details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Plan Name *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="billing">Billing Period *</Label>
                <Select value={billingPeriod} onValueChange={setBillingPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="maxBoards">Max Boards *</Label>
                <Input
                  id="maxBoards"
                  type="number"
                  value={maxBoards}
                  onChange={(e) => setMaxBoards(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxUsers">Max Users *</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  value={maxUsers}
                  onChange={(e) => setMaxUsers(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid gap-3">
              <Label>Features</Label>
              <div className="space-y-2">
                {Object.entries(features).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => setFeatures((prev) => ({ ...prev, [key]: checked as boolean }))}
                    />
                    <label htmlFor={key} className="text-sm text-slate-700 capitalize cursor-pointer">
                      {key.replace(/_/g, " ")}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800">
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
