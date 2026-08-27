export type StudentStatus =
  | "enrolled"
  | "active"
  | "completed"
  | "dropped"

export type StudentStatusLabel =
  | "Enrolled"
  | "Active"
  | "Completed"
  | "Dropped"

export type StudentView = {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string
  courseSlug: string
  courseTitle: string
  courseKey: string
  registrationType: string
  schoolName: string
  location: string
  courseRegistrationId: string | null
  pifApplicationId: string | null
  status: StudentStatus
  statusLabel: StudentStatusLabel
  enrolledAt: string
  enrolledAtLabel: string
  notes: string
  financePaymentId: string | null
  createdAt: string
  updatedAt: string
}

export type StudentListStats = {
  total: number
  enrolled: number
  active: number
  thisWeek: number
}

export const STUDENT_STATUSES = new Set<StudentStatus>([
  "enrolled",
  "active",
  "completed",
  "dropped",
])

export const STUDENT_STATUS_LABELS: Record<StudentStatus, StudentStatusLabel> =
  {
    enrolled: "Enrolled",
    active: "Active",
    completed: "Completed",
    dropped: "Dropped",
  }

export const STUDENT_STATUS_FILTERS = [
  "all",
  "enrolled",
  "active",
  "completed",
  "dropped",
] as const

export type StudentStatusFilter = (typeof STUDENT_STATUS_FILTERS)[number]

export function isStudentStatus(value: string): value is StudentStatus {
  return STUDENT_STATUSES.has(value as StudentStatus)
}

export function parseStudentStatusFilter(
  value: string | undefined
): StudentStatusFilter {
  if (
    value &&
    (STUDENT_STATUS_FILTERS as readonly string[]).includes(value)
  ) {
    return value as StudentStatusFilter
  }
  return "all"
}

export function formatStudentDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    const fallback = new Date(value)
    if (Number.isNaN(fallback.getTime())) return value
    return fallback.toLocaleDateString(undefined, { dateStyle: "medium" })
  }
  return date.toLocaleDateString(undefined, { dateStyle: "medium" })
}
