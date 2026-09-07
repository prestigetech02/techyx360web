import "server-only"

import {
  getStaffAccentClass,
  getStaffInitials,
  isStaffStatus,
} from "@/lib/team/team-types"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import type { Database } from "@/types/database"
import {
  isStaffTaskPriority,
  isStaffTaskStatus,
  type StaffTaskView,
  type WorkAssignee,
} from "@/lib/work/task-types"

export type {
  StaffTaskPriority,
  StaffTaskStatus,
  StaffTaskView,
  WorkAssignee,
} from "@/lib/work/task-types"

export {
  isStaffTaskPriority,
  isStaffTaskStatus,
  STAFF_TASK_PRIORITIES,
  STAFF_TASK_PRIORITY_LABELS,
  STAFF_TASK_STATUSES,
  STAFF_TASK_STATUS_LABELS,
} from "@/lib/work/task-types"

export type StaffTaskRow = Database["public"]["Tables"]["staff_tasks"]["Row"]

type TeamMemberLiteRow = Pick<
  Database["public"]["Tables"]["team_members"]["Row"],
  "id" | "full_name" | "email" | "role" | "department" | "status"
>

const TASK_SELECT =
  "id, title, notes, assignee_id, status, priority, scheduled_on, sort_order, created_by, created_at, updated_at"

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

function mapTaskRow(
  row: StaffTaskRow,
  assigneesById: Map<string, WorkAssignee>
): StaffTaskView {
  const assignee =
    row.assignee_id && assigneesById.has(row.assignee_id)
      ? (assigneesById.get(row.assignee_id) ?? null)
      : null

  return {
    id: row.id,
    title: row.title,
    notes: row.notes ?? "",
    status: isStaffTaskStatus(row.status) ? row.status : "todo",
    priority: isStaffTaskPriority(row.priority) ? row.priority : "medium",
    scheduledOn: row.scheduled_on,
    sortOrder: row.sort_order,
    assigneeId: row.assignee_id,
    assignee,
    createdBy: row.created_by ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function loadAssigneesByIds(ids: string[]) {
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
    console.error("Failed to load staff task assignees", error)
    return new Map<string, WorkAssignee>()
  }

  const map = new Map<string, WorkAssignee>()
  for (const row of data ?? []) {
    map.set(row.id, mapAssignee(row))
  }
  return map
}

export async function getWorkAssignees(): Promise<WorkAssignee[]> {
  if (!isSupabaseConfigured()) return []

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("team_members")
    .select(ASSIGNEE_SELECT)
    .order("full_name", { ascending: true })

  if (error) {
    console.error("Failed to load work assignees", error)
    throw new Error("Unable to load team members.")
  }

  return (data ?? []).map(mapAssignee)
}

export async function getAllStaffTasks(options?: {
  assigneeId?: string | null
}): Promise<StaffTaskView[]> {
  if (!isSupabaseConfigured()) return []

  const supabase = createAdminClient()
  let query = supabase
    .from("staff_tasks")
    .select(TASK_SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })

  if (options?.assigneeId) {
    query = query.eq("assignee_id", options.assigneeId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Failed to load staff tasks", error)
    throw new Error("Unable to load staff tasks.")
  }

  const rows = data ?? []
  const assigneesById = await loadAssigneesByIds(
    rows.map((row) => row.assignee_id).filter((id): id is string => Boolean(id))
  )

  return rows.map((row) => mapTaskRow(row, assigneesById))
}

export async function getStaffTaskById(
  id: string
): Promise<StaffTaskView | null> {
  if (!isSupabaseConfigured()) return null

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("staff_tasks")
    .select(TASK_SELECT)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("Failed to load staff task", error)
    throw new Error("Unable to load staff task.")
  }

  if (!data) return null

  const assigneesById = await loadAssigneesByIds(
    data.assignee_id ? [data.assignee_id] : []
  )
  return mapTaskRow(data, assigneesById)
}

export async function assertTeamMemberExists(id: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("team_members")
    .select("id")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("Failed to verify team member for staff task", error)
    throw new Error("Unable to verify team member.")
  }

  return Boolean(data)
}
