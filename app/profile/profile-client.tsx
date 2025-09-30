"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { User } from "@supabase/supabase-js"
import { updateProfile, updatePassword } from "@/lib/actions/profile"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface ProfileClientProps {
  user: User
  fullName: string
}

export function ProfileClient({ user, fullName }: ProfileClientProps) {
  const [name, setName] = useState(fullName)
  const [email, setEmail] = useState(user.email || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isLoadingPassword, setIsLoadingPassword] = useState(false)
  const router = useRouter()

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoadingProfile(true)

    try {
      await updateProfile(name, email)
      toast.success("Perfil atualizado com sucesso!")
      router.refresh()
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast.error("Erro ao atualizar perfil")
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem")
      return
    }

    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres")
      return
    }

    setIsLoadingPassword(true)

    try {
      await updatePassword(newPassword)
      toast.success("Senha atualizada com sucesso!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error("Failed to update password:", error)
      toast.error("Erro ao atualizar senha")
    } finally {
      setIsLoadingPassword(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Perfil</h1>
        <p className="text-slate-600 mt-2">Gerencie suas informações pessoais e configurações de conta</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
            <CardDescription>Atualize seu nome e email</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-sm text-slate-500">
                  Alterar o email enviará um link de confirmação para o novo endereço
                </p>
              </div>
              <Button type="submit" disabled={isLoadingProfile} className="bg-slate-900 hover:bg-slate-800">
                {isLoadingProfile ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Change Card */}
        <Card>
          <CardHeader>
            <CardTitle>Alterar Senha</CardTitle>
            <CardDescription>Atualize sua senha de acesso</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Digite a senha novamente"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoadingPassword} className="bg-slate-900 hover:bg-slate-800">
                {isLoadingPassword ? "Atualizando..." : "Atualizar Senha"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
