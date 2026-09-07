import type { StaffStatus } from "@/lib/team/team-types"

export type StaffTaskStatus = "todo" | "in_progress" | "done" | "blocked"

export type StaffTaskPriority = "low" | "medium" | "high"

export type WorkAssignee = {
  id: string
  fullName: string
  email: string
  role: string
  department: string
  status: StaffStatus
  initials: string
  accent: string
}

export type StaffTaskView = {
  id: string
  title: string
  notes: string
  status: StaffTaskStatus
  priority: StaffTaskPriority
  scheduledOn: string | null
  startTime: string | null
  endTime: string | null
  durationMinutes: number | null
  sortOrder: number
  assigneeId: string | null
  assignee: WorkAssignee | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export const STAFF_TASK_STATUSES = [
  "todo",
  "in_progress",
  "done",
  "blocked",
] as const

export const STAFF_TASK_PRIORITIES = ["low", "medium", "high"] as const

export const STAFF_TASK_STATUS_LABELS: Record<StaffTaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
  blocked: "Blocked",
}

export const STAFF_TASK_PRIORITY_LABELS: Record<StaffTaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
}

export const STAFF_TASK_STATUS_SET = new Set<string>(STAFF_TASK_STATUSES)
export const STAFF_TASK_PRIORITY_SET = new Set<string>(STAFF_TASK_PRIORITIES)

export function isStaffTaskStatus(value: string): value is StaffTaskStatus {
  return STAFF_TASK_STATUS_SET.has(value)
}

export function isStaffTaskPriority(value: string): value is StaffTaskPriority {
  return STAFF_TASK_PRIORITY_SET.has(value)
}
