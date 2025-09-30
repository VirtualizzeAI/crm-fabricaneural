"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(fullName: string, email: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Update user profile in users table
  const { error: profileError } = await supabase.from("users").update({ full_name: fullName }).eq("id", user.id)

  if (profileError) throw profileError

  // Update email in auth if changed
  if (email !== user.email) {
    const { error: emailError } = await supabase.auth.updateUser({
      email: email,
    })

    if (emailError) throw emailError
  }

  revalidatePath("/profile")
}

export async function updatePassword(newPassword: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error

  revalidatePath("/profile")
}
