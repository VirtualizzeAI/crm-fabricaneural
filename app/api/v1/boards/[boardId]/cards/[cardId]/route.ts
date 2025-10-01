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

export async function GET(request: NextRequest, { params }: { params: Promise<{ boardId: string; cardId: string }> }) {
  try {
    const { boardId, cardId } = await params
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

    // Verify card belongs to board and client
    const { data: card, error } = await supabase
      .from("cards")
      .select("*, boards!inner(client_id), stages(name, color)")
      .eq("id", cardId)
      .eq("board_id", boardId)
      .eq("boards.client_id", apiKeyData.client_id)
      .single()

    if (error || !card) {
      return NextResponse.json({ error: "Card não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ card })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string; cardId: string }> },
) {
  try {
    const { boardId, cardId } = await params
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
    const { title, description, email, phone, stageId, status } = body

    const supabase = await createClient()

    // Verify card belongs to board and client
    const { data: card } = await supabase
      .from("cards")
      .select("*, boards!inner(client_id)")
      .eq("id", cardId)
      .eq("board_id", boardId)
      .eq("boards.client_id", apiKeyData.client_id)
      .single()

    if (!card) {
      return NextResponse.json({ error: "Card não encontrado" }, { status: 404 })
    }

    const updates: any = {}
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (email !== undefined) updates.email = email
    if (phone !== undefined) updates.phone = phone
    if (status !== undefined) updates.status = status
    if (stageId !== undefined) {
      // Verify stage exists and belongs to board
      const { data: stage } = await supabase
        .from("stages")
        .select("*")
        .eq("id", stageId)
        .eq("board_id", boardId)
        .single()

      if (!stage) {
        return NextResponse.json({ error: "Etapa não encontrada" }, { status: 404 })
      }
      updates.stage_id = stageId
    }

    const { data: updatedCard, error } = await supabase.from("cards").update(updates).eq("id", cardId).select().single()

    if (error) {
      return NextResponse.json({ error: "Erro ao atualizar card" }, { status: 500 })
    }

    return NextResponse.json({ card: updatedCard })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string; cardId: string }> },
) {
  try {
    const { boardId, cardId } = await params
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

    // Verify card belongs to board and client
    const { data: card } = await supabase
      .from("cards")
      .select("*, boards!inner(client_id)")
      .eq("id", cardId)
      .eq("board_id", boardId)
      .eq("boards.client_id", apiKeyData.client_id)
      .single()

    if (!card) {
      return NextResponse.json({ error: "Card não encontrado" }, { status: 404 })
    }

    const { error } = await supabase.from("cards").delete().eq("id", cardId)

    if (error) {
      return NextResponse.json({ error: "Erro ao deletar card" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
