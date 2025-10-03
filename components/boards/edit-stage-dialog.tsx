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
import { updateStage } from "@/lib/actions/stages"
import { useRouter } from "next/navigation"

interface EditStageDialogProps {
  stage: {
    id: string
    name: string
    color: string | null
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

const colorOptions = [
  { name: "Purple", value: "#a855f7" },
  { name: "Orange", value: "#f97316" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Green", value: "#22c55e" },
  { name: "Red", value: "#ef4444" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Yellow", value: "#eab308" },
]

export function EditStageDialog({ stage, open, onOpenChange }: EditStageDialogProps) {
  const [name, setName] = useState(stage.name)
  const [color, setColor] = useState(stage.color || colorOptions[0].value)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateStage(stage.id, name, color)
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to update stage:", error)
      alert("Failed to update stage")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Stage</DialogTitle>
            <DialogDescription>Update the stage name and color</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Stage Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions?.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`h-10 rounded-md border-2 transition-all ${
                      color === option.value ? "border-slate-900 scale-110" : "border-slate-200"
                    }`}
                    style={{ backgroundColor: option.value }}
                    onClick={() => setColor(option.value)}
                    title={option.name}
                  />
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
