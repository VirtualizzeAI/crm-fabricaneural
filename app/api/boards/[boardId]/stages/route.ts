import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST /api/boards/[boardId]/stages - Create new stage
export async function POST(request: NextRequest, { params }: { params: { boardId: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, color } = body

    // Get the highest position
    const { data: stages } = await supabase
      .from("stages")
      .select("position")
      .eq("board_id", params.boardId)
      .order("position", { ascending: false })
      .limit(1)

    const nextPosition = stages && stages.length > 0 ? stages[0].position + 1 : 0

    const { data: stage, error } = await supabase
      .from("stages")
      .insert({
        name,
        color,
        board_id: params.boardId,
        position: nextPosition,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(stage)
  } catch (error) {
    console.error("Error creating stage:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
