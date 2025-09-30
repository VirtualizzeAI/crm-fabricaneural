import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// PUT /api/boards/[boardId]/stages/[stageId] - Update stage
export async function PUT(request: NextRequest, { params }: { params: { boardId: string; stageId: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, color, position } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (color !== undefined) updateData.color = color
    if (position !== undefined) updateData.position = position

    const { data: stage, error } = await supabase
      .from("stages")
      .update(updateData)
      .eq("id", params.stageId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(stage)
  } catch (error) {
    console.error("Error updating stage:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/boards/[boardId]/stages/[stageId] - Delete stage
export async function DELETE(request: NextRequest, { params }: { params: { boardId: string; stageId: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase.from("stages").delete().eq("id", params.stageId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting stage:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
