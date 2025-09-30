"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { CreateBoardDialog } from "./create-board-dialog"
import { deleteBoard } from "@/lib/actions/boards"
import { useRouter } from "next/navigation"

interface BoardListProps {
  boards: Array<{
    id: string
    name: string
    description: string | null
    created_at: string
  }>
}

export function BoardList({ boards }: BoardListProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async (boardId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm("Tem certeza que deseja excluir este quadro? Esta ação não pode ser desfeita.")) {
      return
    }

    try {
      await deleteBoard(boardId)
      router.refresh()
    } catch (error) {
      console.error("Falha ao excluir quadro:", error)
      alert("Falha ao excluir quadro")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Seus Quadros</h2>
          <p className="text-sm text-slate-600">Gerencie seus quadros Kanban</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-slate-900 hover:bg-slate-800">
          <Plus className="mr-2 h-4 w-4" />
          Novo Quadro
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {boards.map((board) => (
          <Link key={board.id} href={`/boards/${board.id}`}>
            <Card className="border-slate-200 transition-all hover:shadow-lg cursor-pointer group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-slate-900 group-hover:text-slate-700">{board.name}</CardTitle>
                    <CardDescription className="text-slate-600 mt-1">
                      {board.description || "Sem descrição"}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => handleDelete(board.id, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500">
                  Criado em {new Date(board.created_at).toLocaleDateString("pt-BR")}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}

        {boards.length === 0 && (
          <Card className="border-slate-200 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-slate-600 mb-4">Nenhum quadro ainda</p>
              <Button onClick={() => setIsCreateOpen(true)} variant="outline" className="border-slate-300">
                <Plus className="mr-2 h-4 w-4" />
                Crie seu primeiro quadro
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateBoardDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}
