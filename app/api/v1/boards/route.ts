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

  // Update last used timestamp
  await supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", apiKeyData.id)

  return apiKeyData
}

export async function GET(request: NextRequest) {
  try {
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
    const { data: boards, error } = await supabase
      .from("boards")
      .select("id, name, description, created_at")
      .eq("client_id", apiKeyData.client_id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Erro ao buscar quadros" }, { status: 500 })
    }

    return NextResponse.json({ boards })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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

    if (!name) {
      return NextResponse.json({ error: "Nome do quadro é obrigatório" }, { status: 400 })
    }

    const supabase = await createClient()

    // Create board
    const { data: board, error: boardError } = await supabase
      .from("boards")
      .insert({
        name,
        description: description || null,
        client_id: apiKeyData.client_id,
        created_by: apiKeyData.created_by,
      })
      .select()
      .single()

    if (boardError) {
      return NextResponse.json({ error: "Erro ao criar quadro" }, { status: 500 })
    }

    // Create default stages
    const defaultStages = [
      { name: "New", position: 0, color: "#a855f7" },
      { name: "Contacted", position: 1, color: "#f97316" },
      { name: "Qualified", position: 2, color: "#06b6d4" },
      { name: "Converted", position: 3, color: "#22c55e" },
    ]

    await supabase.from("stages").insert(
      defaultStages?.map((stage) => ({
        ...stage,
        board_id: board.id,
      })),
    )

    return NextResponse.json({ board }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
