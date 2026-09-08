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
  startsOn?: string | null
  endsOn?: string | null
  scheduledOn?: string | null
  status: string
}) {
  if (task.status === "done") return false
  const end = task.endsOn || task.startsOn || task.scheduledOn
  if (!end) return false
  return end < todayIso()
}

export function taskTouchesDate(
  task: {
    startsOn?: string | null
    endsOn?: string | null
    scheduledOn?: string | null
  },
  iso: string
) {
  const start = task.startsOn || task.scheduledOn
  if (!start) return false
  const end = task.endsOn || start
  return iso >= start && iso <= end
}

export function shiftDateRange(
  startsOn: string | null,
  endsOn: string | null,
  toIso: string
) {
  if (!isIsoDate(toIso)) return { startsOn: toIso, endsOn: toIso }
  if (!startsOn) {
    return { startsOn: toIso, endsOn: endsOn && endsOn > toIso ? endsOn : toIso }
  }
  const spanDays = endsOn
    ? Math.round(
        (parseLocalDate(endsOn).getTime() - parseLocalDate(startsOn).getTime()) /
          86400000
      )
    : 0
  return {
    startsOn: toIso,
    endsOn: addDaysIso(toIso, Math.max(0, spanDays)),
  }
}

export function minutesBetweenDateTimes(
  startsOn: string | null | undefined,
  startTime: string | null | undefined,
  endsOn: string | null | undefined,
  endTime: string | null | undefined
) {
  if (!startsOn || !endsOn) return null
  const start = parseTimeOfDay(startTime)
  const end = parseTimeOfDay(endTime)
  if (!start || !end) return null
  const startAt = new Date(`${startsOn}T${start}:00`)
  const endAt = new Date(`${endsOn}T${end}:00`)
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return null
  }
  const minutes = Math.round((endAt.getTime() - startAt.getTime()) / 60000)
  return minutes > 0 ? minutes : null
}

export function formatTaskSchedule(
  startsOn: string | null | undefined,
  startTime: string | null | undefined,
  endsOn: string | null | undefined,
  endTime: string | null | undefined
) {
  if (!startsOn) return null
  const endDate = endsOn || startsOn
  const startLabel = [
    formatTaskDate(startsOn),
    parseTimeOfDay(startTime) ? formatTimeOfDay(startTime) : "",
  ]
    .filter(Boolean)
    .join(", ")
  if (startsOn === endDate) {
    const range = formatTaskTimeRange(startTime, endTime)
    return range ? `${formatTaskDate(startsOn)} · ${range}` : startLabel
  }
  const endLabel = [
    formatTaskDate(endDate),
    parseTimeOfDay(endTime) ? formatTimeOfDay(endTime) : "",
  ]
    .filter(Boolean)
    .join(", ")
  const minutes = minutesBetweenDateTimes(startsOn, startTime, endDate, endTime)
  return minutes
    ? `${startLabel} → ${endLabel} · ${formatDurationMinutes(minutes)}`
    : `${startLabel} → ${endLabel}`
}

export function formatTaskTimeOnDay(
  task: {
    startsOn?: string | null
    endsOn?: string | null
    scheduledOn?: string | null
    startTime: string | null
    endTime: string | null
  },
  iso: string
) {
  const start = task.startsOn || task.scheduledOn
  const end = task.endsOn || start
  if (!start) return null
  if (start === end) {
    return formatTaskTimeRange(task.startTime, task.endTime)
  }
  if (iso === start) {
    return task.startTime ? `${formatTimeOfDay(task.startTime)} start` : "Starts"
  }
  if (iso === end) {
    return task.endTime ? `${formatTimeOfDay(task.endTime)} end` : "Ends"
  }
  return "Continues"
}

export function parseTimeOfDay(value: string | null | undefined) {
  if (!value) return null
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim())
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return null
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

export function toDbTime(value: string | null) {
  const parsed = parseTimeOfDay(value)
  return parsed ? `${parsed}:00` : null
}

export function minutesBetweenTimes(
  startTime: string | null | undefined,
  endTime: string | null | undefined
) {
  const start = parseTimeOfDay(startTime)
  const end = parseTimeOfDay(endTime)
  if (!start || !end) return null
  const [startHours, startMinutes] = start.split(":").map(Number)
  const [endHours, endMinutes] = end.split(":").map(Number)
  const startTotal = startHours * 60 + startMinutes
  const endTotal = endHours * 60 + endMinutes
  if (endTotal <= startTotal) return null
  return endTotal - startTotal
}

export function formatDurationMinutes(minutes: number | null | undefined) {
  if (minutes == null || minutes <= 0) return "—"
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours > 0 && rest > 0) return `${hours}h ${rest}m`
  if (hours > 0) return `${hours}h`
  return `${rest}m`
}

export function formatTimeOfDay(value: string | null | undefined) {
  const parsed = parseTimeOfDay(value)
  if (!parsed) return "—"
  const [hoursRaw, minutes] = parsed.split(":")
  const hours = Number(hoursRaw)
  const suffix = hours >= 12 ? "PM" : "AM"
  const hour12 = hours % 12 || 12
  return `${hour12}:${minutes} ${suffix}`
}

export function formatTaskTimeRange(
  startTime: string | null | undefined,
  endTime: string | null | undefined
) {
  const start = parseTimeOfDay(startTime)
  const end = parseTimeOfDay(endTime)
  if (!start || !end) return null
  const minutes = minutesBetweenTimes(start, end)
  const range = `${formatTimeOfDay(start)} – ${formatTimeOfDay(end)}`
  if (minutes == null) return range
  return `${range} · ${formatDurationMinutes(minutes)}`
}

export function compareStartTime(
  a: string | null | undefined,
  b: string | null | undefined
) {
  const startA = parseTimeOfDay(a)
  const startB = parseTimeOfDay(b)
  if (!startA && !startB) return 0
  if (!startA) return 1
  if (!startB) return -1
  return startA.localeCompare(startB)
}
