import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/sidebar"
import { BoardList } from "@/components/boards/board-list"
import { getBoards } from "@/lib/actions/boards"

export default async function BoardsPage() {
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

  const boards = await getBoards()

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar userRole={profile.role} />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-slate-200 bg-white px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Quadros Kanban</h1>
          <p className="mt-1 text-sm text-slate-600">Gerencie seu funil de vendas com quadros visuais</p>
        </div>
        <div className="p-8">
          <BoardList boards={boards} />
        </div>
      </div>
    </div>
  )
}
