export function toIsoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

export function todayIso() {
  return toIsoDate(new Date())
}

export function parseLocalDate(iso: string) {
  return new Date(`${iso}T00:00:00`)
}

export function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = parseLocalDate(value)
  return !Number.isNaN(date.getTime())
}

export function addDaysIso(iso: string, days: number) {
  const date = parseLocalDate(iso)
  date.setDate(date.getDate() + days)
  return toIsoDate(date)
}

export function startOfWeekMonday(iso: string) {
  const date = parseLocalDate(iso)
  const weekday = date.getDay()
  const diff = weekday === 0 ? -6 : 1 - weekday
  date.setDate(date.getDate() + diff)
  return toIsoDate(date)
}

export function weekDates(weekStart: string) {
  return Array.from({ length: 7 }, (_, index) => addDaysIso(weekStart, index))
}

export function formatTaskDate(value: string | null) {
  if (!value) return "—"
  const date = parseLocalDate(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })
}

export function formatDayHeading(iso: string) {
  const date = parseLocalDate(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}

export function formatLongDate(iso: string) {
  const date = parseLocalDate(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function formatWeekRange(weekStart: string) {
  const weekEnd = addDaysIso(weekStart, 6)
  return `${formatTaskDate(weekStart)} – ${formatTaskDate(weekEnd)}`
}

export function startOfMonth(iso: string) {
  const date = parseLocalDate(iso)
  date.setDate(1)
  return toIsoDate(date)
}

export function addMonthsIso(iso: string, months: number) {
  const date = parseLocalDate(iso)
  date.setDate(1)
  date.setMonth(date.getMonth() + months)
  return toIsoDate(date)
}

export function formatMonthYear(iso: string) {
  const date = parseLocalDate(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
}

export function monthCells(monthStart: string) {
  const start = startOfMonth(monthStart)
  const gridStart = startOfWeekMonday(start)
  const date = parseLocalDate(start)
  const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1)
  const lastDay = toIsoDate(new Date(nextMonth.getTime() - 86400000))
  const gridEnd = addDaysIso(startOfWeekMonday(lastDay), 6)
  const cells: { iso: string; inMonth: boolean }[] = []
  let cursor = gridStart
  while (cursor <= gridEnd) {
    cells.push({
      iso: cursor,
      inMonth: cursor.slice(0, 7) === start.slice(0, 7),
    })
    cursor = addDaysIso(cursor, 1)
  }
  return cells
}

export function isOverdueTask(task: {
  scheduledOn: string | null
  status: string
}) {
  if (!task.scheduledOn || task.status === "done") return false
  return task.scheduledOn < todayIso()
}
