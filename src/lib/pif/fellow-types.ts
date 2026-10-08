export type PifFellowStatus = "invited" | "active" | "inactive"

export type PifFellowStatusLabel = "Invited" | "Active" | "Inactive"

export type PifFellowView = {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string
  status: PifFellowStatus
  statusLabel: PifFellowStatusLabel
  cohortLabel: string
  preferredTrack: string
  teamId: string | null
  teamName: string | null
  pifApplicationId: string | null
  authUserId: string | null
  notes: string
  invitedAt: string | null
  createdAt: string
  updatedAt: string
}

export const PIF_FELLOW_STATUSES = new Set<PifFellowStatus>([
  "invited",
  "active",
  "inactive",
])

export const PIF_FELLOW_STATUS_LABELS: Record<
  PifFellowStatus,
  PifFellowStatusLabel
> = {
  invited: "Invited",
  active: "Active",
  inactive: "Inactive",
}

export const PIF_FELLOW_STATUS_FILTERS = [
  "all",
  "invited",
  "active",
  "inactive",
] as const

export type PifFellowStatusFilter = (typeof PIF_FELLOW_STATUS_FILTERS)[number]

export type PifFellowListStats = {
  total: number
  invited: number
  active: number
  inactive: number
}

export function isPifFellowStatus(value: string): value is PifFellowStatus {
  return PIF_FELLOW_STATUSES.has(value as PifFellowStatus)
}

export function parsePifFellowStatusFilter(
  value: string | undefined
): PifFellowStatusFilter {
  if (
    value &&
    (PIF_FELLOW_STATUS_FILTERS as readonly string[]).includes(value)
  ) {
    return value as PifFellowStatusFilter
  }
  return "all"
}

export function canFellowAccessPortal(status: PifFellowStatus) {
  return status === "active" || status === "invited"
}
