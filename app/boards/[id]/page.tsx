import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/sidebar"
import { KanbanBoard } from "@/components/boards/kanban-board"
import { getStagesWithCards } from "@/lib/actions/stages"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function BoardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  const { data: board } = await supabase.from("boards").select("*").eq("id", id).single()

  if (!board) {
    redirect("/boards")
  }

  const stages = await getStagesWithCards(id)

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar userRole={profile.role} />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-slate-200 bg-white px-8 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="text-slate-600 hover:text-slate-900">
              <Link href="/boards">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{board.name}</h1>
              {board.description && <p className="mt-1 text-sm text-slate-600">{board.description}</p>}
            </div>
          </div>
        </div>
        <div className="p-8">
          <KanbanBoard boardId={id} stages={stages} />
        </div>
      </div>
    </div>
  )
}
