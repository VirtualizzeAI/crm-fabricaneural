"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Copy, Key, Trash2, Eye, EyeOff } from "lucide-react"
import { generateApiKey, revokeApiKey } from "@/lib/actions/api-keys"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  created_at: string
  last_used_at: string | null
}

interface ApiDocsClientProps {
  apiKeys: ApiKey[]
  userRole: string
}

export function ApiDocsClient({ apiKeys, userRole }: ApiDocsClientProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [keyName, setKeyName] = useState("")
  const [newApiKey, setNewApiKey] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerateKey = async () => {
    if (!keyName.trim()) {
      toast.error("Por favor, insira um nome para a chave")
      return
    }

    setIsLoading(true)
    try {
      const key = await generateApiKey(keyName)
      setNewApiKey(key)
      setKeyName("")
      toast.success("Chave de API criada com sucesso!")
    } catch (error) {
      toast.error("Erro ao criar chave de API")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm("Tem certeza que deseja revogar esta chave? Esta ação não pode ser desfeita.")) {
      return
    }

    try {
      await revokeApiKey(keyId)
      toast.success("Chave revogada com sucesso")
    } catch (error) {
      toast.error("Erro ao revogar chave")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copiado para a área de transferência!")
  }

  const closeDialog = () => {
    setIsCreateDialogOpen(false)
    setNewApiKey(null)
    setShowKey(false)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole={userRole} />
      <div className="flex-1 overflow-auto">
        <div className="border-b bg-card px-4 py-4 md:px-8 md:py-6">
          <h1 className="text-2xl font-bold md:text-3xl">Documentação da API</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gerencie suas chaves de API e consulte a documentação</p>
        </div>

        <div className="p-4 md:p-8">
          <div className="mx-auto max-w-5xl space-y-6">
            {/* API Keys Section */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>Chaves de API</CardTitle>
                    <CardDescription>Gerencie suas chaves de acesso à API</CardDescription>
                  </div>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Key className="mr-2 h-4 w-4" />
                    Nova Chave
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiKeys.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">Nenhuma chave de API criada ainda</p>
                  ) : (
                    <div className="space-y-3">
                      {apiKeys.map((key) => (
                        <div
                          key={key.id}
                          className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                        >
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{key.name}</p>
                              <Badge variant="secondary" className="text-xs">
                                {key.key_prefix}...
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Criada em {new Date(key.created_at).toLocaleDateString("pt-BR")}
                              {key.last_used_at &&
                                ` • Último uso: ${new Date(key.last_used_at).toLocaleDateString("pt-BR")}`}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeKey(key.id)}
                            className="w-full md:w-auto"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Revogar
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* API Documentation */}
            <Card>
              <CardHeader>
                <CardTitle>Endpoints da API</CardTitle>
                <CardDescription>Documentação completa dos endpoints disponíveis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Authentication */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Autenticação</h3>
                  <p className="text-sm text-muted-foreground">
                    Todas as requisições devem incluir o header de autenticação:
                  </p>
                  <div className="rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto">
                    <code>Authorization: Bearer YOUR_API_KEY</code>
                  </div>
                </div>

                {/* Get Boards */}
                <div className="space-y-3 border-t pt-6">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                    <Badge className="w-fit">GET</Badge>
                    <code className="text-sm">/api/v1/boards</code>
                  </div>
                  <p className="text-sm text-muted-foreground">Lista todos os quadros do cliente</p>
                  <div className="rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto">
                    <pre>{`{
  "boards": [
    {
      "id": "uuid",
      "name": "Nome do Quadro",
      "description": "Descrição",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}`}</pre>
                  </div>
                </div>

                {/* Get Board Details */}
                <div className="space-y-3 border-t pt-6">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                    <Badge className="w-fit">GET</Badge>
                    <code className="text-sm">/api/v1/boards/:boardId</code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Retorna detalhes de um quadro específico com todas as etapas e cards
                  </p>
                  <div className="rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto">
                    <pre>{`{
  "board": {
    "id": "uuid",
    "name": "Nome do Quadro",
    "description": "Descrição",
    "stages": [
      {
        "id": "uuid",
        "name": "Nova",
        "position": 0,
        "color": "#3b82f6",
        "cards": [
          {
            "id": "uuid",
            "title": "Lead Title",
            "description": "Descrição",
            "email": "email@example.com",
            "phone": "11 91234-5678",
            "status": "active",
            "position": 0,
            "created_at": "2024-01-01T00:00:00Z"
          }
        ]
      }
    ]
  }
}`}</pre>
                  </div>
                </div>

                {/* Create Card */}
                <div className="space-y-3 border-t pt-6">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                    <Badge className="w-fit bg-green-600">POST</Badge>
                    <code className="text-sm">/api/v1/boards/:boardId/cards</code>
                  </div>
                  <p className="text-sm text-muted-foreground">Cria um novo card em uma etapa</p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Body:</p>
                    <div className="rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto">
                      <pre>{`{
  "stageId": "uuid",
  "title": "Título do Lead",
  "description": "Descrição opcional",
  "email": "email@example.com",
  "phone": "11 91234-5678"
}`}</pre>
                    </div>
                  </div>
                </div>

                {/* Update Card */}
                <div className="space-y-3 border-t pt-6">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                    <Badge className="w-fit bg-yellow-600">PATCH</Badge>
                    <code className="text-sm">/api/v1/boards/:boardId/cards/:cardId</code>
                  </div>
                  <p className="text-sm text-muted-foreground">Atualiza um card existente</p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Body:</p>
                    <div className="rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto">
                      <pre>{`{
  "title": "Novo título",
  "description": "Nova descrição",
  "email": "newemail@example.com",
  "phone": "11 98765-4321",
  "stageId": "uuid" // opcional, para mover entre etapas
}`}</pre>
                    </div>
                  </div>
                </div>

                {/* Delete Card */}
                <div className="space-y-3 border-t pt-6">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                    <Badge className="w-fit bg-red-600">DELETE</Badge>
                    <code className="text-sm">/api/v1/boards/:boardId/cards/:cardId</code>
                  </div>
                  <p className="text-sm text-muted-foreground">Remove um card</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create API Key Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{newApiKey ? "Chave de API Criada" : "Criar Nova Chave de API"}</DialogTitle>
            <DialogDescription>
              {newApiKey
                ? "Copie sua chave agora. Você não poderá vê-la novamente."
                : "Dê um nome descritivo para sua chave de API"}
            </DialogDescription>
          </DialogHeader>

          {newApiKey ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Sua Chave de API</Label>
                <div className="flex gap-2">
                  <Input
                    value={newApiKey}
                    readOnly
                    type={showKey ? "text" : "password"}
                    className="font-mono text-sm"
                  />
                  <Button variant="outline" size="icon" onClick={() => setShowKey(!showKey)}>
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(newApiKey)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 p-4 text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Guarde esta chave em um local seguro. Por motivos de segurança, não será possível visualizá-la
                novamente.
              </div>
              <Button onClick={closeDialog} className="w-full">
                Entendi
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">Nome da Chave</Label>
                <Input
                  id="keyName"
                  placeholder="Ex: Integração Produção"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                />
              </div>
              <Button onClick={handleGenerateKey} disabled={isLoading} className="w-full">
                {isLoading ? "Gerando..." : "Gerar Chave"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
