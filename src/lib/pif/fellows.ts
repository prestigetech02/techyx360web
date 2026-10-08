import "server-only"

import {
  canFellowAccessPortal,
  isPifFellowStatus,
  parsePifFellowStatusFilter,
  PIF_FELLOW_STATUS_LABELS,
  type PifFellowListStats,
  type PifFellowStatus,
  type PifFellowStatusFilter,
  type PifFellowView,
} from "@/lib/pif/fellow-types"
import {
  DEFAULT_ADMIN_PAGE_SIZE,
  getAdminPaginationMeta,
  getAdminRange,
  parseAdminPage,
  type AdminPaginationMeta,
} from "@/lib/admin/pagination"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/types/database"

export type PifFellowRow = Database["public"]["Tables"]["pif_fellows"]["Row"]

export type PifFellowsPageData = {
  fellows: PifFellowView[]
  pagination: AdminPaginationMeta
  stats: PifFellowListStats
  statusFilter: PifFellowStatusFilter
}

const SELECT_COLUMNS =
  "id, first_name, last_name, email, phone, status, cohort_label, preferred_track, team_id, pif_application_id, auth_user_id, notes, invited_at, created_at, updated_at"

function mapFellowRow(
  row: PifFellowRow,
  teamName: string | null = null
): PifFellowView {
  const status = isPifFellowStatus(row.status) ? row.status : "invited"
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: `${row.first_name} ${row.last_name}`.trim(),
    email: row.email,
    phone: row.phone,
    status,
    statusLabel: PIF_FELLOW_STATUS_LABELS[status],
    cohortLabel: row.cohort_label,
    preferredTrack: row.preferred_track,
    teamId: row.team_id ?? null,
    teamName,
    pifApplicationId: row.pif_application_id,
    authUserId: row.auth_user_id,
    notes: row.notes,
    invitedAt: row.invited_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function loadTeamNames(teamIds: Array<string | null | undefined>) {
  const ids = [...new Set(teamIds.filter(Boolean) as string[])]
  const map = new Map<string, string>()
  if (ids.length === 0) return map

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("pif_teams")
    .select("id, name")
    .in("id", ids)

  if (error) return map
  for (const row of data ?? []) {
    map.set(row.id, row.name)
  }
  return map
}

async function getFellowStats(): Promise<PifFellowListStats> {
  const supabase = createAdminClient()
  const [total, invited, active, inactive] = await Promise.all([
    supabase.from("pif_fellows").select("id", { count: "exact", head: true }),
    supabase
      .from("pif_fellows")
      .select("id", { count: "exact", head: true })
      .eq("status", "invited"),
    supabase
      .from("pif_fellows")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("pif_fellows")
      .select("id", { count: "exact", head: true })
      .eq("status", "inactive"),
  ])

  return {
    total: total.count ?? 0,
    invited: invited.count ?? 0,
    active: active.count ?? 0,
    inactive: inactive.count ?? 0,
  }
}

export async function getPifFellowsPageData(options: {
  page?: string
  status?: string
  pageSize?: number
}): Promise<PifFellowsPageData> {
  const pageSize = options.pageSize ?? DEFAULT_ADMIN_PAGE_SIZE
  const statusFilter = parsePifFellowStatusFilter(options.status)
  const requestedPage = parseAdminPage(options.page)
  const supabase = createAdminClient()

  let countQuery = supabase
    .from("pif_fellows")
    .select("id", { count: "exact", head: true })

  if (statusFilter !== "all") {
    countQuery = countQuery.eq("status", statusFilter)
  }

  const { count: filteredTotal, error: countError } = await countQuery
  if (countError) throw countError

  const total = filteredTotal ?? 0
  const paginationMeta = getAdminPaginationMeta(requestedPage, pageSize, total)
  const { from, to } = getAdminRange(paginationMeta.page, pageSize)

  let dataQuery = supabase
    .from("pif_fellows")
    .select(SELECT_COLUMNS)
    .order("created_at", { ascending: false })
    .range(from, to)

  if (statusFilter !== "all") {
    dataQuery = dataQuery.eq("status", statusFilter)
  }

  const [{ data, error }, stats] = await Promise.all([
    dataQuery,
    getFellowStats(),
  ])

  if (error) throw error

  const rows = data ?? []
  const teamNames = await loadTeamNames(rows.map((row) => row.team_id))

  return {
    fellows: rows.map((row) =>
      mapFellowRow(row, row.team_id ? (teamNames.get(row.team_id) ?? null) : null)
    ),
    pagination: paginationMeta,
    stats,
    statusFilter,
  }
}

async function mapFellowWithTeam(row: PifFellowRow) {
  const teamNames = await loadTeamNames([row.team_id])
  return mapFellowRow(
    row,
    row.team_id ? (teamNames.get(row.team_id) ?? null) : null
  )
}

export async function getPifFellowById(id: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("pif_fellows")
    .select(SELECT_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  return data ? mapFellowWithTeam(data) : null
}

export async function getPifFellowByEmail(email: string) {
  const address = email.trim().toLowerCase()
  if (!address) return null

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("pif_fellows")
    .select(SELECT_COLUMNS)
    .ilike("email", address)
    .maybeSingle()

  if (error) {
    if (error.message?.includes("pif_fellows")) return null
    throw error
  }

  return data ? mapFellowWithTeam(data) : null
}

export async function createPifFellow(input: {
  firstName: string
  lastName: string
  email: string
  phone?: string
  cohortLabel?: string
  preferredTrack?: string
  teamId?: string | null
  notes?: string
  status?: PifFellowStatus
}) {
  const email = input.email.trim().toLowerCase()
  if (!email.includes("@")) {
    throw new Error("Enter a valid email address.")
  }

  const supabase = createAdminClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("pif_fellows")
    .insert({
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      email,
      phone: input.phone?.trim() ?? "",
      cohort_label: input.cohortLabel?.trim() ?? "",
      preferred_track: input.preferredTrack?.trim() ?? "",
      team_id: input.teamId || null,
      notes: input.notes?.trim() ?? "",
      status: input.status ?? "invited",
      updated_at: now,
    })
    .select(SELECT_COLUMNS)
    .single()

  if (error || !data) {
    if (error?.message?.includes("pif_fellows_email_unique")) {
      throw new Error("A fellow with this email already exists.")
    }
    if (error?.message?.includes("pif_fellows")) {
      throw new Error("Run supabase/pif-fellows.sql in Supabase first.")
    }
    throw error ?? new Error("Unable to create fellow.")
  }

  return mapFellowWithTeam(data)
}

export async function updatePifFellow(
  id: string,
  input: {
    firstName?: string
    lastName?: string
    phone?: string
    status?: PifFellowStatus
    cohortLabel?: string
    preferredTrack?: string
    teamId?: string | null
    notes?: string
    authUserId?: string | null
    invitedAt?: string | null
  }
) {
  const supabase = createAdminClient()
  const patch: Database["public"]["Tables"]["pif_fellows"]["Update"] = {
    updated_at: new Date().toISOString(),
  }

  if (input.firstName !== undefined) patch.first_name = input.firstName.trim()
  if (input.lastName !== undefined) patch.last_name = input.lastName.trim()
  if (input.phone !== undefined) patch.phone = input.phone.trim()
  if (input.status !== undefined) patch.status = input.status
  if (input.cohortLabel !== undefined) {
    patch.cohort_label = input.cohortLabel.trim()
  }
  if (input.preferredTrack !== undefined) {
    patch.preferred_track = input.preferredTrack.trim()
  }
  if (input.teamId !== undefined) patch.team_id = input.teamId || null
  if (input.notes !== undefined) patch.notes = input.notes.trim()
  if (input.authUserId !== undefined) patch.auth_user_id = input.authUserId
  if (input.invitedAt !== undefined) patch.invited_at = input.invitedAt

  const { data, error } = await supabase
    .from("pif_fellows")
    .update(patch)
    .eq("id", id)
    .select(SELECT_COLUMNS)
    .single()

  if (error || !data) {
    throw error ?? new Error("Unable to update fellow.")
  }

  return mapFellowWithTeam(data)
}

export async function deletePifFellow(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("pif_fellows").delete().eq("id", id)
  if (error) throw error
}

export async function assertFellowCanSignIn(email: string) {
  const fellow = await getPifFellowByEmail(email)
  if (!fellow) {
    throw new Error("This account is not registered as a PIF fellow.")
  }
  if (!canFellowAccessPortal(fellow.status)) {
    throw new Error("This fellow account is inactive. Contact your facilitator.")
  }
  return fellow
}

export async function activatePifFellowOnLogin(options: {
  email: string
  authUserId?: string | null
}) {
  const fellow = await assertFellowCanSignIn(options.email)
  if (fellow.status === "active" && fellow.authUserId) {
    return fellow
  }

  return updatePifFellow(fellow.id, {
    status: "active",
    authUserId: options.authUserId ?? fellow.authUserId,
  })
}
