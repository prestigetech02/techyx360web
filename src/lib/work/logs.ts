import "server-only"

import {
  getStaffAccentClass,
  getStaffInitials,
  isStaffStatus,
} from "@/lib/team/team-types"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import type { Database } from "@/types/database"
import type { StaffDailyLogView } from "@/lib/work/log-types"
import type { WorkAssignee } from "@/lib/work/task-types"

export type { StaffDailyLogView } from "@/lib/work/log-types"
export { hasLoggedWork } from "@/lib/work/log-types"

export type StaffDailyLogRow =
  Database["public"]["Tables"]["staff_daily_logs"]["Row"]

type TeamMemberLiteRow = Pick<
  Database["public"]["Tables"]["team_members"]["Row"],
  "id" | "full_name" | "email" | "role" | "department" | "status"
>

const LOG_SELECT =
  "id, member_id, log_date, summary, hours_spent, created_by, created_at, updated_at"

const ASSIGNEE_SELECT = "id, full_name, email, role, department, status"

function mapAssignee(row: TeamMemberLiteRow): WorkAssignee {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    department: row.department,
    status: isStaffStatus(row.status) ? row.status : "active",
    initials: getStaffInitials(row.full_name),
    accent: getStaffAccentClass(row.id),
  }
}

function mapLogRow(
  row: StaffDailyLogRow,
  membersById: Map<string, WorkAssignee>
): StaffDailyLogView {
  const hours =
    row.hours_spent == null ? null : Number(row.hours_spent)

  return {
    id: row.id,
    memberId: row.member_id,
    member: membersById.get(row.member_id) ?? null,
    logDate: row.log_date,
    summary: row.summary ?? "",
    hoursSpent:
      hours == null || Number.isNaN(hours) ? null : hours,
    createdBy: row.created_by ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function loadMembersByIds(ids: string[]) {
  const uniqueIds = [...new Set(ids.filter(Boolean))]
  if (uniqueIds.length === 0) {
    return new Map<string, WorkAssignee>()
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("team_members")
    .select(ASSIGNEE_SELECT)
    .in("id", uniqueIds)

  if (error) {
    console.error("Failed to load daily log members", error)
    return new Map<string, WorkAssignee>()
  }

  const map = new Map<string, WorkAssignee>()
  for (const row of data ?? []) {
    map.set(row.id, mapAssignee(row))
  }
  return map
}

export async function getStaffDailyLogs(options?: {
  memberId?: string | null
}): Promise<StaffDailyLogView[]> {
  if (!isSupabaseConfigured()) return []

  const supabase = createAdminClient()
  let query = supabase
    .from("staff_daily_logs")
    .select(LOG_SELECT)
    .order("log_date", { ascending: false })
    .limit(1000)

  if (options?.memberId) {
    query = query.eq("member_id", options.memberId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Failed to load staff daily logs", error)
    throw new Error("Unable to load daily logs.")
  }

  const rows = data ?? []
  const membersById = await loadMembersByIds(rows.map((row) => row.member_id))
  return rows.map((row) => mapLogRow(row, membersById))
}

export async function getStaffDailyLogById(id: string) {
  if (!isSupabaseConfigured()) return null

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("staff_daily_logs")
    .select(LOG_SELECT)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("Failed to load staff daily log", error)
    throw new Error("Unable to load daily log.")
  }

  if (!data) return null
  const membersById = await loadMembersByIds([data.member_id])
  return mapLogRow(data, membersById)
}

export async function upsertStaffDailyLog(input: {
  member_id: string
  log_date: string
  summary: string
  hours_spent: number | null
  created_by: string
}) {
  const supabase = createAdminClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("staff_daily_logs")
    .upsert(
      {
        member_id: input.member_id,
        log_date: input.log_date,
        summary: input.summary,
        hours_spent: input.hours_spent,
        created_by: input.created_by,
        updated_at: now,
      },
      { onConflict: "member_id,log_date" }
    )
    .select("id")
    .single()

  if (error || !data) {
    console.error("Failed to save staff daily log", error)
    throw new Error("Unable to save daily log.")
  }

  return getStaffDailyLogById(data.id)
}

export async function deleteStaffDailyLog(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("staff_daily_logs").delete().eq("id", id)

  if (error) {
    console.error("Failed to delete staff daily log", error)
    throw new Error("Unable to delete daily log.")
  }
}
