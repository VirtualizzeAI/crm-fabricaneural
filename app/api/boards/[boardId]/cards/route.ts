import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST /api/boards/[boardId]/cards - Create new card
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
    const { stageId, title, description, phone, email, status } = body

    // Get the highest position in the stage
    const { data: cards } = await supabase
      .from("cards")
      .select("position")
      .eq("stage_id", stageId)
      .order("position", { ascending: false })
      .limit(1)

    const nextPosition = cards && cards?.length > 0 ? cards[0].position + 1 : 0

    const { data: card, error } = await supabase
      .from("cards")
      .insert({
        title,
        description,
        board_id: params.boardId,
        stage_id: stageId,
        position: nextPosition,
        phone,
        email,
        status,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(card)
  } catch (error) {
    console.error("Error creating card:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
