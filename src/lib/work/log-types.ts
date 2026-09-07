import type { WorkAssignee } from "@/lib/work/task-types"

export type StaffDailyLogView = {
  id: string
  memberId: string
  member: WorkAssignee | null
  logDate: string
  summary: string
  hoursSpent: number | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export function hasLoggedWork(log: StaffDailyLogView | null | undefined) {
  return Boolean(log?.summary.trim())
}
