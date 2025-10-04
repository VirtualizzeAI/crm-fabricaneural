import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

async function validateApiKey(apiKey: string) {
  const supabase = await createClient()
  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex")

  const { data: apiKeyData, error } = await supabase
    .from("api_keys")
    .select("*, clients(*)")
    .eq("key_hash", keyHash)
    .is("revoked_at", null)
    .single()

  if (error || !apiKeyData) {
    return null
  }

  await supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", apiKeyData.id)

  return apiKeyData
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ boardId: string }> }) {
  try {
    const { boardId } = await params
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "API key não fornecida" }, { status: 401 })
    }

    const apiKey = authHeader.substring(7)
    const apiKeyData = await validateApiKey(apiKey)

    if (!apiKeyData) {
      return NextResponse.json({ error: "API key inválida" }, { status: 401 })
    }

    const supabase = await createClient()

    // Verify board belongs to client
    const { data: board, error: boardError } = await supabase
      .from("boards")
      .select("*")
      .eq("id", boardId)
      .eq("client_id", apiKeyData.client_id)
      .single()

    if (boardError || !board) {
      return NextResponse.json({ error: "Quadro não encontrado" }, { status: 404 })
    }

    // Get stages with cards
    const { data: stages, error: stagesError } = await supabase
      .from("stages")
      .select("*")
      .eq("board_id", boardId)
      .order("position", { ascending: true })

    if (stagesError) {
      return NextResponse.json({ error: "Erro ao buscar etapas" }, { status: 500 })
    }

    // Get cards for each stage
    const stagesWithCards = await Promise.all(
      (stages || [])?.map(async (stage) => {
        const { data: cards } = await supabase
          .from("cards")
          .select("id, title, description, email, phone, status, position, created_at")
          .eq("stage_id", stage.id)
          .order("position", { ascending: true })

        return {
          ...stage,
          cards: cards || [],
        }
      }),
    )

    return NextResponse.json({
      board: {
        ...board,
        stages: stagesWithCards,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ boardId: string }> }) {
  try {
    const { boardId } = await params
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "API key não fornecida" }, { status: 401 })
    }

    const apiKey = authHeader.substring(7)
    const apiKeyData = await validateApiKey(apiKey)

    if (!apiKeyData) {
      return NextResponse.json({ error: "API key inválida" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description } = body

    const supabase = await createClient()

    // Verify board belongs to client
    const { data: board } = await supabase
      .from("boards")
      .select("*")
      .eq("id", boardId)
      .eq("client_id", apiKeyData.client_id)
      .single()

    if (!board) {
      return NextResponse.json({ error: "Quadro não encontrado" }, { status: 404 })
    }

    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description

    const { data: updatedBoard, error } = await supabase
      .from("boards")
      .update(updates)
      .eq("id", boardId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Erro ao atualizar quadro" }, { status: 500 })
    }

    return NextResponse.json({ board: updatedBoard })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ boardId: string }> }) {
  try {
    const { boardId } = await params
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "API key não fornecida" }, { status: 401 })
    }

    const apiKey = authHeader.substring(7)
    const apiKeyData = await validateApiKey(apiKey)

    if (!apiKeyData) {
      return NextResponse.json({ error: "API key inválida" }, { status: 401 })
    }

    const supabase = await createClient()

    // Verify board belongs to client
    const { data: board } = await supabase
      .from("boards")
      .select("*")
      .eq("id", boardId)
      .eq("client_id", apiKeyData.client_id)
      .single()

    if (!board) {
      return NextResponse.json({ error: "Quadro não encontrado" }, { status: 404 })
    }

    const { error } = await supabase.from("boards").delete().eq("id", boardId)

    if (error) {
      return NextResponse.json({ error: "Erro ao deletar quadro" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
