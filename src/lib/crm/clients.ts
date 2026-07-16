import "server-only"

import {
  formatClientWebsite,
  getClientAvatarClass,
  getClientInitials,
  type ClientNoteView,
  type ClientStatus,
  type ClientView,
} from "@/lib/crm/client-types"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import type { Database } from "@/types/database"

export type {
  ClientNoteView,
  ClientStatus,
  ClientView,
} from "@/lib/crm/client-types"

export {
  CLIENT_COMPANY_SIZES,
  CLIENT_STATUSES,
  clientWebsiteHref,
  formatClientWebsite,
  getClientAvatarClass,
  getClientInitials,
} from "@/lib/crm/client-types"

export type CrmClientRow = Database["public"]["Tables"]["crm_clients"]["Row"]
export type CrmClientNoteRow =
  Database["public"]["Tables"]["crm_client_notes"]["Row"]

function formatClientDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatClientDateTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatRelativeActivity(value: string) {
  const then = new Date(value).getTime()
  const now = Date.now()
  const diffMs = Math.max(0, now - then)
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`
  if (days < 30) {
    const weeks = Math.floor(days / 7)
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`
  }
  return formatClientDate(value)
}

function isClientStatus(value: string): value is ClientStatus {
  return value === "active" || value === "inactive" || value === "archived"
}

export function mapClientNoteRow(row: CrmClientNoteRow): ClientNoteView {
  return {
    id: row.id,
    content: row.content,
    author: row.author_name,
    date: formatClientDateTime(row.created_at),
    createdAt: row.created_at,
  }
}

export function mapClientRowToView(
  row: CrmClientRow,
  notes: CrmClientNoteRow[] = []
): ClientView {
  const activitySource = row.last_activity_at ?? row.updated_at ?? row.created_at

  return {
    id: row.id,
    company: row.company,
    industry: row.industry,
    product: row.product,
    initials: getClientInitials(row.company),
    avatarClass: getClientAvatarClass(row.id),
    avatarUrl: row.avatar_url?.trim() || null,
    contact: row.contact_name,
    role: row.role,
    email: row.email,
    phone: row.phone,
    website: formatClientWebsite(row.website),
    location: row.location,
    companySize: row.company_size,
    clientSince: formatClientDate(row.created_at),
    status: isClientStatus(row.status) ? row.status : "active",
    lastActivity: formatRelativeActivity(activitySource),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    notes: notes.map(mapClientNoteRow),
  }
}

const CLIENT_SELECT =
  "id, company, contact_name, email, phone, industry, product, role, website, location, company_size, status, last_activity_at, avatar_url, created_at, updated_at"

export async function getAllClients(): Promise<ClientView[]> {
  if (!isSupabaseConfigured()) return []

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crm_clients")
    .select(CLIENT_SELECT)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to load CRM clients", error)
    throw error
  }

  const clients = data ?? []
  if (clients.length === 0) return []

  const ids = clients.map((client) => client.id)
  const notesResult = await supabase
    .from("crm_client_notes")
    .select("id, client_id, content, author_name, created_at")
    .in("client_id", ids)
    .order("created_at", { ascending: false })

  if (notesResult.error) {
    console.error("Failed to load CRM client notes", notesResult.error)
  }

  const notesByClient = new Map<string, CrmClientNoteRow[]>()
  for (const note of notesResult.data ?? []) {
    const list = notesByClient.get(note.client_id) ?? []
    list.push(note)
    notesByClient.set(note.client_id, list)
  }

  return clients.map((client) =>
    mapClientRowToView(client, notesByClient.get(client.id) ?? [])
  )
}

export async function getClientById(id: string): Promise<ClientView | null> {
  if (!isSupabaseConfigured()) return null

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crm_clients")
    .select(CLIENT_SELECT)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("Failed to load CRM client", error)
    throw error
  }

  if (!data) return null

  const notesResult = await supabase
    .from("crm_client_notes")
    .select("id, client_id, content, author_name, created_at")
    .eq("client_id", id)
    .order("created_at", { ascending: false })

  return mapClientRowToView(data, notesResult.data ?? [])
}

export async function touchClientActivity(clientId: string) {
  const supabase = createAdminClient()
  const now = new Date().toISOString()
  const { error } = await supabase
    .from("crm_clients")
    .update({ last_activity_at: now, updated_at: now })
    .eq("id", clientId)

  if (error) {
    console.error("Failed to touch CRM client activity", error)
    throw error
  }
}
