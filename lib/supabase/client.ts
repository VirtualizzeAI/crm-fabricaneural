import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Client - Missing Supabase environment variables")
    throw new Error("Supabase URL and Anon Key are required. Please check your environment variables.")
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
