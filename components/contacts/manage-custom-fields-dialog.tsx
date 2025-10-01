"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import { createCustomField, deleteCustomField } from "@/lib/actions/contacts"
import { useRouter } from "next/navigation"
import type { CustomField } from "@/lib/types"

interface ManageCustomFieldsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customFields: CustomField[]
}

export function ManageCustomFieldsDialog({ open, onOpenChange, customFields }: ManageCustomFieldsDialogProps) {
  const [name, setName] = useState("")
  const [fieldType, setFieldType] = useState("text")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await createCustomField(name, fieldType)
      setName("")
      setFieldType("text")
      router.refresh()
    } catch (error) {
      console.error("Failed to create custom field:", error)
      alert("Falha ao criar campo personalizado")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (fieldId: string, fieldName: string) => {
    if (!confirm(`Tem certeza que deseja deletar o campo "${fieldName}"?`)) {
      return
    }

    try {
      await deleteCustomField(fieldId)
      router.refresh()
    } catch (error) {
      console.error("Failed to delete custom field:", error)
      alert("Falha ao deletar campo")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Campos Personalizados</DialogTitle>
          <DialogDescription>Crie campos personalizados para seus contatos</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="field-name">Nome do Campo</Label>
            <Input
              id="field-name"
              placeholder="Ex: Empresa, Cargo, Cidade..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="field-type">Tipo do Campo</Label>
            <Select value={fieldType} onValueChange={setFieldType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Texto</SelectItem>
                <SelectItem value="textarea">Texto Longo</SelectItem>
                <SelectItem value="number">Número</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Telefone</SelectItem>
                <SelectItem value="url">URL</SelectItem>
                <SelectItem value="date">Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            {isLoading ? "Criando..." : "Adicionar Campo"}
          </Button>
        </form>

        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-medium mb-3">Campos Existentes</h4>
          {customFields.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum campo personalizado criado</p>
          ) : (
            <div className="space-y-2">
              {customFields.map((field) => (
                <div key={field.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="text-sm font-medium">{field.name}</p>
                    <p className="text-xs text-muted-foreground">{field.field_type}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(field.id, field.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
