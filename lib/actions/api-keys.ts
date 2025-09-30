"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

export async function generateApiKey(name: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Não autenticado")
  }

  const { data: profile } = await supabase.from("profiles").select("client_id").eq("id", user.id).single()

  if (!profile?.client_id) {
    throw new Error("Perfil não encontrado")
  }

  // Generate a random API key
  const apiKey = `fbn_${crypto.randomBytes(32).toString("hex")}`
  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex")
  const keyPrefix = apiKey.substring(0, 12)

  const { error } = await supabase.from("api_keys").insert({
    client_id: profile.client_id,
    key_hash: keyHash,
    key_prefix: keyPrefix,
    name,
    created_by: user.id,
  })

  if (error) {
    throw new Error("Erro ao criar chave de API")
  }

  revalidatePath("/api-docs")
  return apiKey
}

export async function getApiKeys() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Não autenticado")
  }

  const { data: profile } = await supabase.from("profiles").select("client_id").eq("id", user.id).single()

  if (!profile?.client_id) {
    throw new Error("Perfil não encontrado")
  }

  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("client_id", profile.client_id)
    .is("revoked_at", null)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Erro ao buscar chaves de API")
  }

  return data
}

export async function revokeApiKey(keyId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Não autenticado")
  }

  const { error } = await supabase.from("api_keys").update({ revoked_at: new Date().toISOString() }).eq("id", keyId)

  if (error) {
    throw new Error("Erro ao revogar chave de API")
  }

  revalidatePath("/api-docs")
}
