export type PifTeamStatus = "active" | "archived"

export type PifTeamView = {
  id: string
  name: string
  cohortLabel: string
  description: string
  status: PifTeamStatus
  fellowCount: number
  attendanceOpen: boolean
  currentWeek: number
  currentDay: number
  attendanceOpenedAt: string | null
  sessionLabel: string
  createdAt: string
  updatedAt: string
}

export const PIF_TEAM_STATUSES = new Set<PifTeamStatus>(["active", "archived"])

export function isPifTeamStatus(value: string): value is PifTeamStatus {
  return PIF_TEAM_STATUSES.has(value as PifTeamStatus)
}

export function formatTeamSessionLabel(week: number, day: number, teamName?: string) {
  const base = `Week ${week}, Day ${day}`
  return teamName ? `${base} for ${teamName}` : base
}

export function parsePositiveInt(
  value: unknown,
  fallback: number,
  min = 1,
  max = 52
) {
  const parsed =
    typeof value === "number"
      ? value
      : Number.parseInt(typeof value === "string" ? value : "", 10)
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) return fallback
  return parsed
}
