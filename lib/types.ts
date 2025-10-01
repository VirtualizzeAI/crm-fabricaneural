export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: "user" | "admin" | "super_admin"
  client_id: string | null
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string | null
  plan_id: string | null
  status: "active" | "inactive" | "suspended"
  created_at: string
  updated_at: string
}

export interface Plan {
  id: string
  name: string
  description: string | null
  price: number
  billing_period: "monthly" | "quarterly" | "yearly"
  max_boards: number
  max_users: number
  features: Record<string, boolean>
  created_at: string
  updated_at: string
}

export interface Board {
  id: string
  name: string
  description: string | null
  client_id: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface Stage {
  id: string
  name: string
  board_id: string
  position: number
  color: string | null
  created_at: string
  updated_at: string
}

export interface Card {
  id: string
  title: string
  description: string | null
  stage_id: string
  board_id: string
  position: number
  phone: string | null
  email: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  totalLeads: number
  newLeads: number
  contactedLeads: number
  qualifiedLeads: number
  convertedLeads: number
  lostLeads: number
  conversionRate: number
  leadsOverTime: Array<{ date: string; count: number }>
  leadsByTags: Array<{ tag: string; count: number }>
}

export interface Tag {
  id: string
  name: string
  color: string
  client_id: string
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  name: string
  phone: string
  email: string | null
  client_id: string
  created_by: string
  created_at: string
  updated_at: string
  tags?: Tag[]
  custom_values?: ContactCustomValue[]
}

export interface CustomField {
  id: string
  name: string
  field_type: "text" | "number" | "date" | "email" | "phone" | "url" | "textarea"
  client_id: string
  created_at: string
}

export interface ContactCustomValue {
  id: string
  contact_id: string
  custom_field_id: string
  value: string | null
  custom_field?: CustomField
  created_at: string
  updated_at: string
}
