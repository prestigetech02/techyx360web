import "server-only"

import {
  getLeadAvatarClass,
  getLeadInitials,
  LEAD_ACTIVITY_TYPES,
  type LeadActivityType,
  type LeadActivityView,
  type LeadNoteView,
  type LeadStatus,
  type LeadView,
} from "@/lib/crm/lead-types"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import type { Database } from "@/types/database"

export type {
  LeadActivityType,
  LeadActivityView,
  LeadNoteView,
  LeadStatus,
  LeadView,
} from "@/lib/crm/lead-types"

export {
  getLeadAvatarClass,
  getLeadInitials,
  LEAD_ACTIVITY_TYPES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  statusChangeTitle,
} from "@/lib/crm/lead-types"

export type CrmLeadRow = Database["public"]["Tables"]["crm_leads"]["Row"]
export type CrmLeadNoteRow =
  Database["public"]["Tables"]["crm_lead_notes"]["Row"]
export type CrmLeadActivityRow =
  Database["public"]["Tables"]["crm_lead_activities"]["Row"]

function formatLeadDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function isLeadStatus(value: string): value is LeadStatus {
  return (
    value === "new" ||
    value === "contacted" ||
    value === "qualified" ||
    value === "converted" ||
    value === "lost"
  )
}

function isLeadActivityType(value: string): value is LeadActivityType {
  return LEAD_ACTIVITY_TYPES.has(value as LeadActivityType)
}

export function mapLeadNoteRow(row: CrmLeadNoteRow): LeadNoteView {
  return {
    id: row.id,
    content: row.content,
    author: row.author_name,
    date: formatLeadDate(row.created_at),
    createdAt: row.created_at,
  }
}

export function mapLeadActivityRow(row: CrmLeadActivityRow): LeadActivityView {
  return {
    id: row.id,
    type: isLeadActivityType(row.type) ? row.type : "system",
    title: row.title,
    timestamp: formatLeadDate(row.created_at),
    author: row.author_name,
    createdAt: row.created_at,
  }
}

export function mapLeadRowToView(
  row: CrmLeadRow,
  notes: CrmLeadNoteRow[] = [],
  activities: CrmLeadActivityRow[] = []
): LeadView {
  return {
    id: row.id,
    name: row.full_name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    source: row.source,
    status: isLeadStatus(row.status) ? row.status : "new",
    initials: getLeadInitials(row.full_name),
    avatarClass: getLeadAvatarClass(row.id),
    assignedTo: row.assigned_to?.trim() || "Unassigned",
    score: row.score,
    created: formatLeadDate(row.created_at),
    createdAt: row.created_at,
    clientId: row.client_id,
    notes: notes.map(mapLeadNoteRow),
    activities: activities.map(mapLeadActivityRow),
  }
}

const LEAD_SELECT =
  "id, full_name, email, phone, company, source, status, assigned_to, score, client_id, created_at, updated_at"

export async function getAllLeads(): Promise<LeadView[]> {
  if (!isSupabaseConfigured()) return []

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crm_leads")
    .select(LEAD_SELECT)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to load CRM leads", error)
    throw error
  }

  const leads = data ?? []
  if (leads.length === 0) return []

  const ids = leads.map((lead) => lead.id)

  const [notesResult, activitiesResult] = await Promise.all([
    supabase
      .from("crm_lead_notes")
      .select("id, lead_id, content, author_name, created_at")
      .in("lead_id", ids)
      .order("created_at", { ascending: false }),
    supabase
      .from("crm_lead_activities")
      .select("id, lead_id, type, title, author_name, created_at")
      .in("lead_id", ids)
      .order("created_at", { ascending: false }),
  ])

  if (notesResult.error) {
    console.error("Failed to load CRM lead notes", notesResult.error)
  }
  if (activitiesResult.error) {
    console.error("Failed to load CRM lead activities", activitiesResult.error)
  }

  const notesByLead = new Map<string, CrmLeadNoteRow[]>()
  for (const note of notesResult.data ?? []) {
    const list = notesByLead.get(note.lead_id) ?? []
    list.push(note)
    notesByLead.set(note.lead_id, list)
  }

  const activitiesByLead = new Map<string, CrmLeadActivityRow[]>()
  for (const activity of activitiesResult.data ?? []) {
    const list = activitiesByLead.get(activity.lead_id) ?? []
    list.push(activity)
    activitiesByLead.set(activity.lead_id, list)
  }

  return leads.map((lead) =>
    mapLeadRowToView(
      lead,
      notesByLead.get(lead.id) ?? [],
      activitiesByLead.get(lead.id) ?? []
    )
  )
}

export async function getLeadById(id: string): Promise<LeadView | null> {
  if (!isSupabaseConfigured()) return null

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crm_leads")
    .select(LEAD_SELECT)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("Failed to load CRM lead", error)
    throw error
  }

  if (!data) return null

  const [notesResult, activitiesResult] = await Promise.all([
    supabase
      .from("crm_lead_notes")
      .select("id, lead_id, content, author_name, created_at")
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("crm_lead_activities")
      .select("id, lead_id, type, title, author_name, created_at")
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
  ])

  return mapLeadRowToView(
    data,
    notesResult.data ?? [],
    activitiesResult.data ?? []
  )
}

export async function insertLeadActivity(input: {
  leadId: string
  type: LeadActivityType
  title: string
  authorName?: string
}) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("crm_lead_activities").insert({
    lead_id: input.leadId,
    type: input.type,
    title: input.title,
    author_name: input.authorName?.trim() || "System",
  })

  if (error) {
    console.error("Failed to insert CRM lead activity", error)
    throw error
  }
}
