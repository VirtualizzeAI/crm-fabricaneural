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
import { createPlan } from "@/lib/actions/admin"
import { useRouter } from "next/navigation"

interface CreatePlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePlanDialog({ open, onOpenChange }: CreatePlanDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [billingPeriod, setBillingPeriod] = useState("monthly")
  const [maxBoards, setMaxBoards] = useState("")
  const [maxUsers, setMaxUsers] = useState("")
  const [features, setFeatures] = useState({
    custom_stages: true,
    analytics: false,
    priority_support: false,
    api_access: false,
    white_label: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await createPlan(
        name,
        description,
        Number.parseFloat(price),
        billingPeriod,
        Number.parseInt(maxBoards),
        Number.parseInt(maxUsers),
        features,
      )
      setName("")
      setDescription("")
      setPrice("")
      setBillingPeriod("monthly")
      setMaxBoards("")
      setMaxUsers("")
      setFeatures({
        custom_stages: true,
        analytics: false,
        priority_support: false,
        api_access: false,
        white_label: false,
      })
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to create plan:", error)
      alert("Failed to create plan")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Plan</DialogTitle>
            <DialogDescription>Add a new subscription plan</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                placeholder="Professional"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="For growing teams..."
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
                  placeholder="29.99"
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
                  placeholder="10"
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
                  placeholder="25"
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
              {isLoading ? "Creating..." : "Create Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
