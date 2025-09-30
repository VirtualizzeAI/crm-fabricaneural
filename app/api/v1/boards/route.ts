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
