import "server-only"

import {
  formatAttendanceDateTime,
  todayDateOnly,
  type PifAttendanceRecordView,
  type PifAttendanceSummary,
  type PifSessionRoster,
} from "@/lib/pif/attendance-types"
import { formatTeamSessionLabel } from "@/lib/pif/team-types"
import { anyPifTeamAttendanceOpen, getPifTeamById } from "@/lib/pif/teams"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/types/database"

type RecordRow = Database["public"]["Tables"]["pif_attendance_records"]["Row"]

function isMissingAttendanceTable(error: { message?: string } | null) {
  const message = error?.message ?? ""
  return (
    message.includes("pif_attendance_records") ||
    message.includes("week_number") ||
    message.includes("team_id")
  )
}

export async function isPifAttendanceOpen() {
  try {
    return await anyPifTeamAttendanceOpen()
  } catch {
    return false
  }
}

export async function getFellowTeamAttendanceState(fellowId: string) {
  const supabase = createAdminClient()
  const { data: fellow, error } = await supabase
    .from("pif_fellows")
    .select("id, team_id")
    .eq("id", fellowId)
    .maybeSingle()

  if (error) throw error
  if (!fellow?.team_id) {
    return {
      isOpen: false,
      sessionLabel: "",
      teamId: null as string | null,
      week: null as number | null,
      day: null as number | null,
      alreadyMarked: false,
      markedAt: null as string | null,
      reason: "no_team" as const,
    }
  }

  const team = await getPifTeamById(fellow.team_id)
  if (!team || team.status !== "active") {
    return {
      isOpen: false,
      sessionLabel: "",
      teamId: fellow.team_id,
      week: null,
      day: null,
      alreadyMarked: false,
      markedAt: null,
      reason: "team_unavailable" as const,
    }
  }

  const isOpen = team.attendanceOpen
  const existing = isOpen
    ? await getFellowAttendanceForSession({
        fellowId: fellow.id,
        teamId: team.id,
        week: team.currentWeek,
        day: team.currentDay,
      })
    : null

  return {
    isOpen,
    sessionLabel: team.sessionLabel,
    teamId: team.id,
    week: team.currentWeek,
    day: team.currentDay,
    alreadyMarked: Boolean(existing),
    markedAt: existing?.marked_at ?? null,
    reason: isOpen ? ("ok" as const) : ("closed" as const),
  }
}

export async function getFellowAttendanceForSession(options: {
  fellowId: string
  teamId: string
  week: number
  day: number
}) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("pif_attendance_records")
    .select(
      "id, fellow_id, team_id, week_number, day_number, attendance_date, marked_at, notes, created_at"
    )
    .eq("fellow_id", options.fellowId)
    .eq("team_id", options.teamId)
    .eq("week_number", options.week)
    .eq("day_number", options.day)
    .maybeSingle()

  if (error) {
    if (isMissingAttendanceTable(error)) return null
    throw error
  }

  return data
}

/** @deprecated use getFellowAttendanceForSession */
export async function getFellowAttendanceForDate(
  fellowId: string,
  attendanceDate = todayDateOnly()
) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("pif_attendance_records")
    .select(
      "id, fellow_id, team_id, week_number, day_number, attendance_date, marked_at, notes, created_at"
    )
    .eq("fellow_id", fellowId)
    .eq("attendance_date", attendanceDate)
    .maybeSingle()

  if (error) {
    if (isMissingAttendanceTable(error)) return null
    throw error
  }

  return data
}

export async function markPifAttendance(input: { fellowId: string }) {
  const supabase = createAdminClient()

  const { data: fellow, error: fellowError } = await supabase
    .from("pif_fellows")
    .select("id, team_id")
    .eq("id", input.fellowId)
    .maybeSingle()

  if (fellowError) throw fellowError
  if (!fellow) throw new Error("Fellow not found.")
  if (!fellow.team_id) {
    throw new Error("You are not assigned to a team yet. Contact your facilitator.")
  }

  const team = await getPifTeamById(fellow.team_id)
  if (!team) throw new Error("Your team could not be found.")
  if (team.status !== "active") {
    throw new Error("Attendance is closed at the moment, Please come back later")
  }
  if (!team.attendanceOpen) {
    throw new Error("Attendance is closed at the moment, Please come back later")
  }

  const existing = await getFellowAttendanceForSession({
    fellowId: fellow.id,
    teamId: team.id,
    week: team.currentWeek,
    day: team.currentDay,
  })
  if (existing) {
    throw new Error("You have already marked attendance for this session.")
  }

  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from("pif_attendance_records")
    .insert({
      fellow_id: fellow.id,
      team_id: team.id,
      week_number: team.currentWeek,
      day_number: team.currentDay,
      attendance_date: todayDateOnly(),
      marked_at: now,
      notes: "",
    })
    .select(
      "id, fellow_id, team_id, week_number, day_number, attendance_date, marked_at, notes, created_at"
    )
    .single()

  if (error || !data) {
    if (
      error?.message?.includes("pif_attendance_records_fellow_session_unique") ||
      error?.message?.includes("pif_attendance_records_fellow_date_unique")
    ) {
      throw new Error("You have already marked attendance for this session.")
    }
    if (isMissingAttendanceTable(error)) {
      throw new Error(
        "Run supabase/pif-attendance.sql, supabase/pif-attendance-per-team.sql, and supabase/pif-attendance-hardening.sql in Supabase first."
      )
    }
    throw error ?? new Error("Unable to mark attendance.")
  }

  return {
    ...data,
    sessionLabel: team.sessionLabel,
  }
}

async function hydrateRecords(rows: RecordRow[]): Promise<PifAttendanceRecordView[]> {
  const supabase = createAdminClient()
  const fellowIds = [...new Set(rows.map((row) => row.fellow_id))]
  const teamIds = [
    ...new Set(rows.map((row) => row.team_id).filter(Boolean) as string[]),
  ]

  const fellowMap = new Map<string, { fullName: string; email: string }>()
  const teamMap = new Map<string, string>()

  if (fellowIds.length > 0) {
    const { data: fellows } = await supabase
      .from("pif_fellows")
      .select("id, first_name, last_name, email")
      .in("id", fellowIds)
    for (const fellow of fellows ?? []) {
      fellowMap.set(fellow.id, {
        fullName: `${fellow.first_name} ${fellow.last_name}`.trim(),
        email: fellow.email,
      })
    }
  }

  if (teamIds.length > 0) {
    const { data: teams } = await supabase
      .from("pif_teams")
      .select("id, name")
      .in("id", teamIds)
    for (const team of teams ?? []) {
      teamMap.set(team.id, team.name)
    }
  }

  return rows.map((row) => {
    const fellow = fellowMap.get(row.fellow_id)
    const teamName = row.team_id ? (teamMap.get(row.team_id) ?? null) : null
    const week = row.week_number
    const day = row.day_number
    return {
      id: row.id,
      fellowId: row.fellow_id,
      fellowName: fellow?.fullName ?? "Unknown fellow",
      fellowEmail: fellow?.email ?? "",
      teamId: row.team_id,
      teamName,
      weekNumber: week,
      dayNumber: day,
      sessionLabel:
        week && day
          ? formatTeamSessionLabel(week, day, teamName ?? undefined)
          : "—",
      attendanceDate: row.attendance_date,
      markedAt: row.marked_at,
      markedAtLabel: formatAttendanceDateTime(row.marked_at),
    }
  })
}

export async function getTeamSessionRoster(
  teamId: string
): Promise<PifSessionRoster | null> {
  const team = await getPifTeamById(teamId)
  if (!team) return null

  const supabase = createAdminClient()
  const { data: fellows, error: fellowsError } = await supabase
    .from("pif_fellows")
    .select("id, first_name, last_name, email, status")
    .eq("team_id", teamId)
    .order("first_name", { ascending: true })

  if (fellowsError) throw fellowsError

  const { data: marks, error: marksError } = await supabase
    .from("pif_attendance_records")
    .select("fellow_id, marked_at")
    .eq("team_id", teamId)
    .eq("week_number", team.currentWeek)
    .eq("day_number", team.currentDay)

  if (marksError) {
    if (isMissingAttendanceTable(marksError)) {
      return {
        teamId: team.id,
        teamName: team.name,
        week: team.currentWeek,
        day: team.currentDay,
        sessionLabel: team.sessionLabel,
        attendanceOpen: team.attendanceOpen,
        markedCount: 0,
        totalCount: fellows?.length ?? 0,
        fellows: (fellows ?? []).map((fellow) => ({
          fellowId: fellow.id,
          fellowName: `${fellow.first_name} ${fellow.last_name}`.trim(),
          fellowEmail: fellow.email,
          status: fellow.status,
          marked: false,
          markedAt: null,
          markedAtLabel: null,
        })),
      }
    }
    throw marksError
  }

  const markedMap = new Map(
    (marks ?? []).map((row) => [row.fellow_id, row.marked_at])
  )

  const roster = (fellows ?? []).map((fellow) => {
    const markedAt = markedMap.get(fellow.id) ?? null
    return {
      fellowId: fellow.id,
      fellowName: `${fellow.first_name} ${fellow.last_name}`.trim(),
      fellowEmail: fellow.email,
      status: fellow.status,
      marked: Boolean(markedAt),
      markedAt,
      markedAtLabel: markedAt ? formatAttendanceDateTime(markedAt) : null,
    }
  })

  return {
    teamId: team.id,
    teamName: team.name,
    week: team.currentWeek,
    day: team.currentDay,
    sessionLabel: team.sessionLabel,
    attendanceOpen: team.attendanceOpen,
    markedCount: roster.filter((row) => row.marked).length,
    totalCount: roster.length,
    fellows: roster,
  }
}

export async function listAttendanceHistory(options?: {
  teamId?: string
  week?: number
  limit?: number
}) {
  const supabase = createAdminClient()
  let query = supabase
    .from("pif_attendance_records")
    .select(
      "id, fellow_id, team_id, week_number, day_number, attendance_date, marked_at, notes, created_at"
    )
    .order("marked_at", { ascending: false })
    .limit(options?.limit ?? 200)

  if (options?.teamId) query = query.eq("team_id", options.teamId)
  if (options?.week) query = query.eq("week_number", options.week)

  const { data, error } = await query
  if (error) {
    if (isMissingAttendanceTable(error)) return []
    throw error
  }

  return hydrateRecords((data ?? []) as RecordRow[])
}

export async function getAttendanceSummary(): Promise<PifAttendanceSummary> {
  const supabase = createAdminClient()
  const today = todayDateOnly()

  const [recordsResult, openTeamsResult] = await Promise.all([
    supabase
      .from("pif_attendance_records")
      .select("id, team_id, week_number, attendance_date"),
    supabase
      .from("pif_teams")
      .select("id", { count: "exact", head: true })
      .eq("attendance_open", true)
      .eq("status", "active"),
  ])

  if (recordsResult.error) {
    if (isMissingAttendanceTable(recordsResult.error)) {
      return {
        totalMarks: 0,
        todayMarks: 0,
        openTeams: 0,
        teamsWithMarks: 0,
        byTeam: [],
        byWeek: [],
      }
    }
    throw recordsResult.error
  }

  const rows = recordsResult.data ?? []
  const teamCounts = new Map<string, number>()
  const weekCounts = new Map<number, number>()
  let todayMarks = 0

  for (const row of rows) {
    if (row.attendance_date === today) todayMarks += 1
    if (row.team_id) {
      teamCounts.set(row.team_id, (teamCounts.get(row.team_id) ?? 0) + 1)
    }
    if (typeof row.week_number === "number") {
      weekCounts.set(row.week_number, (weekCounts.get(row.week_number) ?? 0) + 1)
    }
  }

  const teamIds = [...teamCounts.keys()]
  const teamNames = new Map<string, string>()
  if (teamIds.length > 0) {
    const { data: teams } = await supabase
      .from("pif_teams")
      .select("id, name")
      .in("id", teamIds)
    for (const team of teams ?? []) {
      teamNames.set(team.id, team.name)
    }
  }

  return {
    totalMarks: rows.length,
    todayMarks,
    openTeams: openTeamsResult.count ?? 0,
    teamsWithMarks: teamCounts.size,
    byTeam: [...teamCounts.entries()]
      .map(([teamId, count]) => ({
        teamId,
        teamName: teamNames.get(teamId) ?? "Unknown team",
        count,
      }))
      .sort((a, b) => b.count - a.count),
    byWeek: [...weekCounts.entries()]
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week - b.week),
  }
}

/** Kept for older admin panel imports during transition */
export async function listTodayAttendanceRecords() {
  const records = await listAttendanceHistory({ limit: 500 })
  const today = todayDateOnly()
  return records.filter((row) => row.attendanceDate === today)
}

export async function getPifAttendanceSettings() {
  const isOpen = await isPifAttendanceOpen()
  return {
    isOpen,
    sessionLabel: "",
    openedAt: null,
    closedAt: null,
    updatedAt: new Date().toISOString(),
  }
}
