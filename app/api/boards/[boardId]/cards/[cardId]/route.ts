import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// PUT /api/boards/[boardId]/cards/[cardId] - Update card
export async function PUT(request: NextRequest, { params }: { params: { boardId: string; cardId: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, phone, email, status, stageId, position } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (phone !== undefined) updateData.phone = phone
    if (email !== undefined) updateData.email = email
    if (status !== undefined) updateData.status = status
    if (stageId !== undefined) updateData.stage_id = stageId
    if (position !== undefined) updateData.position = position

    const { data: card, error } = await supabase
      .from("cards")
      .update(updateData)
      .eq("id", params.cardId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(card)
  } catch (error) {
    console.error("Error updating card:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/boards/[boardId]/cards/[cardId] - Delete card
export async function DELETE(request: NextRequest, { params }: { params: { boardId: string; cardId: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase.from("cards").delete().eq("id", params.cardId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting card:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
