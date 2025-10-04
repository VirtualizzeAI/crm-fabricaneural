import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/boards/[boardId] - Get board with stages and cards
export async function GET(request: NextRequest, { params }: { params: { boardId: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get board
    const { data: board, error: boardError } = await supabase
      .from("boards")
      .select("*")
      .eq("id", params.boardId)
      .single()

    if (boardError) {
      return NextResponse.json({ error: boardError.message }, { status: 500 })
    }

    // Get stages with cards
    const { data: stages, error: stagesError } = await supabase
      .from("stages")
      .select(`
        *,
        cards (*)
      `)
      .eq("board_id", params.boardId)
      .order("position", { ascending: true })

    if (stagesError) {
      return NextResponse.json({ error: stagesError.message }, { status: 500 })
    }

    return NextResponse.json({
      board,
      stages: stages?.map((stage) => ({
        ...stage,
        cards: (stage.cards as any[]).sort((a, b) => a.position - b.position),
      })),
    })
  } catch (error) {
    console.error("Error fetching board:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/boards/[boardId] - Update board
export async function PUT(request: NextRequest, { params }: { params: { boardId: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description } = body

    const { data: board, error } = await supabase
      .from("boards")
      .update({ name, description })
      .eq("id", params.boardId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(board)
  } catch (error) {
    console.error("Error updating board:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/boards/[boardId] - Delete board
export async function DELETE(request: NextRequest, { params }: { params: { boardId: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase.from("boards").delete().eq("id", params.boardId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting board:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
