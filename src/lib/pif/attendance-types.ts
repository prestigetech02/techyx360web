export type PifAttendanceRecordView = {
  id: string
  fellowId: string
  fellowName: string
  fellowEmail: string
  teamId: string | null
  teamName: string | null
  weekNumber: number | null
  dayNumber: number | null
  sessionLabel: string
  attendanceDate: string
  markedAt: string
  markedAtLabel: string
}

export type PifAttendanceSummary = {
  totalMarks: number
  todayMarks: number
  openTeams: number
  teamsWithMarks: number
  byTeam: Array<{
    teamId: string
    teamName: string
    count: number
  }>
  byWeek: Array<{
    week: number
    count: number
  }>
}

export type PifSessionRosterEntry = {
  fellowId: string
  fellowName: string
  fellowEmail: string
  status: string
  marked: boolean
  markedAt: string | null
  markedAtLabel: string | null
}

export type PifSessionRoster = {
  teamId: string
  teamName: string
  week: number
  day: number
  sessionLabel: string
  attendanceOpen: boolean
  markedCount: number
  totalCount: number
  fellows: PifSessionRosterEntry[]
}

export function formatAttendanceDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function formatAttendanceDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export function todayDateOnly() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
