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
    const { data: board } = await supabase
      .from("boards")
      .select("*")
      .eq("id", boardId)
      .eq("client_id", apiKeyData.client_id)
      .single()

    if (!board) {
      return NextResponse.json({ error: "Quadro não encontrado" }, { status: 404 })
    }

    // Get all cards for the board
    const { data: cards, error } = await supabase
      .from("cards")
      .select("*, stages(name, color)")
      .eq("board_id", boardId)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Erro ao buscar cards" }, { status: 500 })
    }

    return NextResponse.json({ cards })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ boardId: string }> }) {
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
    const { stageId, title, description, email, phone } = body

    if (!stageId || !title) {
      return NextResponse.json({ error: "stageId e title são obrigatórios" }, { status: 400 })
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

    // Verify stage belongs to board
    const { data: stage } = await supabase.from("stages").select("*").eq("id", stageId).eq("board_id", boardId).single()

    if (!stage) {
      return NextResponse.json({ error: "Etapa não encontrada" }, { status: 404 })
    }

    // Get next position
    const { data: cards } = await supabase.from("cards").select("position").eq("stage_id", stageId)

    const nextPosition = cards && cards?.length > 0 ? Math.max(...cards?.map((c) => c.position)) + 1 : 0

    // Create card
    const { data: newCard, error } = await supabase
      .from("cards")
      .insert({
        board_id: boardId,
        stage_id: stageId,
        title,
        description: description || null,
        email: email || null,
        phone: phone || null,
        position: nextPosition,
        status: "active",
        created_by: apiKeyData.created_by,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Erro ao criar card" }, { status: 500 })
    }

    return NextResponse.json({ card: newCard }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
