"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getContacts() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase.from("profiles").select("client_id, role").eq("id", user.id).single()

    if (!profile || !profile.client_id) return []

    const { data: contacts, error } = await supabase
      .from("contacts")
      .select(`
        *,
        contact_tags(tag_id, tags(*)),
        contact_custom_values(*, custom_fields(*))
      `)
      .eq("client_id", profile.client_id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching contacts:", error)
      return []
    }

    return contacts || []
  } catch (error) {
    console.error("Error in getContacts:", error)
    return []
  }
}

export async function getContact(contactId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: contact, error } = await supabase
    .from("contacts")
    .select(`
      *,
      contact_tags(tag_id, tags(*)),
      contact_custom_values(*, custom_fields(*))
    `)
    .eq("id", contactId)
    .single()

  if (error) throw error

  return contact
}

export async function createContact(
  name: string,
  phone: string,
  email: string | null,
  tagIds: string[],
  customValues: { fieldId: string; value: string }[],
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("client_id").eq("id", user.id).single()

  if (!profile || !profile.client_id) throw new Error("Profile not found")

  const { data: contact, error } = await supabase
    .from("contacts")
    .insert({
      name,
      phone,
      email,
      client_id: profile.client_id,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) throw error

  // Add tags
  if (tagIds.length > 0) {
    const tagInserts = tagIds.map((tagId) => ({
      contact_id: contact.id,
      tag_id: tagId,
    }))
    await supabase.from("contact_tags").insert(tagInserts)
  }

  // Add custom field values
  if (customValues.length > 0) {
    const valueInserts = customValues
      .filter((cv) => cv.value)
      .map((cv) => ({
        contact_id: contact.id,
        custom_field_id: cv.fieldId,
        value: cv.value,
      }))
    if (valueInserts.length > 0) {
      await supabase.from("contact_custom_values").insert(valueInserts)
    }
  }

  revalidatePath("/contacts")
  return contact
}

export async function updateContact(
  contactId: string,
  name: string,
  phone: string,
  email: string | null,
  tagIds: string[],
  customValues: { fieldId: string; value: string }[],
) {
  const supabase = await createClient()

  const { error } = await supabase.from("contacts").update({ name, phone, email }).eq("id", contactId)

  if (error) throw error

  // Update tags
  await supabase.from("contact_tags").delete().eq("contact_id", contactId)
  if (tagIds.length > 0) {
    const tagInserts = tagIds.map((tagId) => ({
      contact_id: contactId,
      tag_id: tagId,
    }))
    await supabase.from("contact_tags").insert(tagInserts)
  }

  // Update custom values
  await supabase.from("contact_custom_values").delete().eq("contact_id", contactId)
  if (customValues.length > 0) {
    const valueInserts = customValues
      .filter((cv) => cv.value)
      .map((cv) => ({
        contact_id: contactId,
        custom_field_id: cv.fieldId,
        value: cv.value,
      }))
    if (valueInserts.length > 0) {
      await supabase.from("contact_custom_values").insert(valueInserts)
    }
  }

  revalidatePath("/contacts")
}

export async function deleteContact(contactId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("contacts").delete().eq("id", contactId)

  if (error) throw error

  revalidatePath("/contacts")
}

export async function getCustomFields() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase.from("profiles").select("client_id").eq("id", user.id).single()

    if (!profile || !profile.client_id) return []

    const { data: fields, error } = await supabase
      .from("custom_fields")
      .select("*")
      .eq("client_id", profile.client_id)
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching custom fields:", error)
      return []
    }

    return fields || []
  } catch (error) {
    console.error("Error in getCustomFields:", error)
    return []
  }
}

export async function createCustomField(name: string, fieldType: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("client_id").eq("id", user.id).single()

  if (!profile || !profile.client_id) throw new Error("Profile not found")

  const { data: field, error } = await supabase
    .from("custom_fields")
    .insert({
      name,
      field_type: fieldType,
      client_id: profile.client_id,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath("/contacts")
  return field
}

export async function deleteCustomField(fieldId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("custom_fields").delete().eq("id", fieldId)

  if (error) throw error

  revalidatePath("/contacts")
}
