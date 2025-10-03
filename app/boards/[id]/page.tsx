import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/sidebar"
import { KanbanBoard } from "@/components/boards/kanban-board"
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

  const { data: board } = await supabase
    .from("boards")
    .select(
      `
      *,
      stages(
        *,
        cards(*)
      )
    `,
    )
    .eq("id", id)
    .single()

  if (!board) {
    redirect("/boards")
  }

  const stages = board?.stages?
    .map((stage: any) => ({
      ...stage,
      cards: stage.cards.sort((a: any, b: any) => a.position - b.position),
    }))
    .sort((a: any, b: any) => a.position - b.position)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole={profile.role} />
      <div className="flex-1 overflow-auto">
        <div className="border-b bg-card px-4 py-4 md:px-8 md:py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/boards">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">{board.name}</h1>
              {board.description && <p className="mt-1 text-sm text-muted-foreground">{board.description}</p>}
            </div>
          </div>
        </div>
        <div className="p-4 md:p-8">
          <KanbanBoard boardId={id} stages={stages} />
        </div>
      </div>
    </div>
  )
}
