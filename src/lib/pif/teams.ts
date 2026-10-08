import "server-only"

import {
  formatTeamSessionLabel,
  isPifTeamStatus,
  type PifTeamStatus,
  type PifTeamView,
} from "@/lib/pif/team-types"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/types/database"

export type PifTeamRow = Database["public"]["Tables"]["pif_teams"]["Row"]

const SELECT_COLUMNS =
  "id, name, cohort_label, description, status, attendance_open, current_week, current_day, attendance_opened_at, created_at, updated_at"

function mapTeamRow(row: PifTeamRow, fellowCount = 0): PifTeamView {
  const status = isPifTeamStatus(row.status) ? row.status : "active"
  const currentWeek = row.current_week || 1
  const currentDay = row.current_day || 1
  return {
    id: row.id,
    name: row.name,
    cohortLabel: row.cohort_label,
    description: row.description,
    status,
    fellowCount,
    attendanceOpen: Boolean(row.attendance_open),
    currentWeek,
    currentDay,
    attendanceOpenedAt: row.attendance_opened_at,
    sessionLabel: formatTeamSessionLabel(currentWeek, currentDay, row.name),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listPifTeams(options?: { activeOnly?: boolean }) {
  const supabase = createAdminClient()
  let query = supabase
    .from("pif_teams")
    .select(SELECT_COLUMNS)
    .order("name", { ascending: true })

  if (options?.activeOnly) {
    query = query.eq("status", "active")
  }

  const { data, error } = await query
  if (error) {
    if (error.message?.includes("pif_teams")) {
      throw new Error("Run supabase/pif-teams.sql in Supabase first.")
    }
    throw error
  }

  const rows = data ?? []
  const ids = rows.map((row) => row.id)
  const counts = new Map<string, number>()

  if (ids.length > 0) {
    const { data: fellows, error: fellowsError } = await supabase
      .from("pif_fellows")
      .select("team_id")
      .in("team_id", ids)

    if (!fellowsError) {
      for (const fellow of fellows ?? []) {
        if (!fellow.team_id) continue
        counts.set(fellow.team_id, (counts.get(fellow.team_id) ?? 0) + 1)
      }
    }
  }

  return rows.map((row) => mapTeamRow(row, counts.get(row.id) ?? 0))
}

export async function getPifTeamById(id: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("pif_teams")
    .select(SELECT_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const { count } = await supabase
    .from("pif_fellows")
    .select("id", { count: "exact", head: true })
    .eq("team_id", id)

  return mapTeamRow(data, count ?? 0)
}

export async function anyPifTeamAttendanceOpen() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("pif_teams")
    .select("id")
    .eq("attendance_open", true)
    .eq("status", "active")
    .limit(1)

  if (error) {
    if (
      error.message?.includes("attendance_open") ||
      error.message?.includes("pif_teams")
    ) {
      return false
    }
    throw error
  }

  return (data?.length ?? 0) > 0
}

export async function createPifTeam(input: {
  name: string
  cohortLabel?: string
  description?: string
  status?: PifTeamStatus
  currentWeek?: number
  currentDay?: number
}) {
  const name = input.name.trim()
  if (!name) throw new Error("Team name is required.")

  const supabase = createAdminClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("pif_teams")
    .insert({
      name,
      cohort_label: input.cohortLabel?.trim() ?? "",
      description: input.description?.trim() ?? "",
      status: input.status ?? "active",
      current_week: input.currentWeek ?? 1,
      current_day: input.currentDay ?? 1,
      attendance_open: false,
      updated_at: now,
    })
    .select(SELECT_COLUMNS)
    .single()

  if (error || !data) {
    if (error?.message?.includes("pif_teams_name_cohort_unique")) {
      throw new Error("A team with this name already exists for that cohort.")
    }
    if (error?.message?.includes("attendance_open") || error?.message?.includes("current_week")) {
      throw new Error(
        "Run supabase/pif-attendance-per-team.sql in Supabase first."
      )
    }
    if (error?.message?.includes("pif_teams")) {
      throw new Error("Run supabase/pif-teams.sql in Supabase first.")
    }
    throw error ?? new Error("Unable to create team.")
  }

  return mapTeamRow(data)
}

export async function updatePifTeam(
  id: string,
  input: {
    name?: string
    cohortLabel?: string
    description?: string
    status?: PifTeamStatus
    attendanceOpen?: boolean
    currentWeek?: number
    currentDay?: number
  }
) {
  const supabase = createAdminClient()
  const existing = await getPifTeamById(id)
  if (!existing) throw new Error("Team not found.")

  const nextStatus = input.status ?? existing.status
  if (input.attendanceOpen === true && nextStatus !== "active") {
    throw new Error("Only active teams can open attendance.")
  }

  const patch: Database["public"]["Tables"]["pif_teams"]["Update"] = {
    updated_at: new Date().toISOString(),
  }

  if (input.name !== undefined) patch.name = input.name.trim()
  if (input.cohortLabel !== undefined) {
    patch.cohort_label = input.cohortLabel.trim()
  }
  if (input.description !== undefined) {
    patch.description = input.description.trim()
  }
  if (input.status !== undefined) patch.status = input.status
  if (input.currentWeek !== undefined) patch.current_week = input.currentWeek
  if (input.currentDay !== undefined) patch.current_day = input.currentDay
  if (input.attendanceOpen !== undefined) {
    patch.attendance_open = input.attendanceOpen
    patch.attendance_opened_at = input.attendanceOpen
      ? new Date().toISOString()
      : null
  }

  // Archiving a team always closes its attendance window.
  if (nextStatus === "archived") {
    patch.attendance_open = false
    patch.attendance_opened_at = null
  }

  const { data, error } = await supabase
    .from("pif_teams")
    .update(patch)
    .eq("id", id)
    .select(SELECT_COLUMNS)
    .single()

  if (error || !data) {
    if (error?.message?.includes("attendance_open")) {
      throw new Error(
        "Run supabase/pif-attendance-per-team.sql in Supabase first."
      )
    }
    throw error ?? new Error("Unable to update team.")
  }

  return mapTeamRow(data)
}

export async function setTeamAttendanceOpen(
  id: string,
  input: {
    isOpen: boolean
    week?: number
    day?: number
  }
) {
  return updatePifTeam(id, {
    attendanceOpen: input.isOpen,
    currentWeek: input.week,
    currentDay: input.day,
  })
}

export async function deletePifTeam(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("pif_teams").delete().eq("id", id)
  if (error) throw error
}

export async function listTeamFellows(teamId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("pif_fellows")
    .select(
      "id, first_name, last_name, email, phone, status, preferred_track, created_at"
    )
    .eq("team_id", teamId)
    .order("first_name", { ascending: true })

  if (error) throw error
  return data ?? []
}
