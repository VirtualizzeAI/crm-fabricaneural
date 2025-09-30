import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("[v0] Middleware - Supabase URL exists:", !!supabaseUrl)
  console.log("[v0] Middleware - Supabase Key exists:", !!supabaseAnonKey)

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Middleware - Missing Supabase environment variables")
    console.error(
      "[v0] Available env vars:",
      Object.keys(process.env).filter((key) => key.includes("SUPABASE")),
    )

    // Allow the request to continue without authentication check
    return NextResponse.next({
      request,
    })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("[v0] Middleware - User authenticated:", !!user)
    console.log("[v0] Middleware - Current path:", request.nextUrl.pathname)

    // Redirect unauthenticated users to login
    if (!user && !request.nextUrl.pathname.startsWith("/auth") && request.nextUrl.pathname !== "/") {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }

    // Redirect authenticated users away from auth pages
    if (user && request.nextUrl.pathname.startsWith("/auth") && request.nextUrl.pathname !== "/auth/sign-up-success") {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.error("[v0] Middleware - Error getting user:", error)
  }

  return supabaseResponse
}
