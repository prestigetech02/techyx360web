type ParseOk<T> = { ok: true; data: T }
type ParseErr = { ok: false; error: string; status: number }

export type UpsertStaffDailyLogInput = {
  member_id: string
  log_date: string
  summary: string
  hours_spent: number | null
}

function asTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function parseUuid(value: unknown) {
  const raw = asTrimmedString(value)
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      raw
    )
  ) {
    return ""
  }
  return raw
}

function parseIsoDate(value: unknown): string | null {
  const raw = asTrimmedString(value)
  if (!raw) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null
  const date = new Date(`${raw}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null
  return raw
}

function parseHoursSpent(value: unknown): number | null | undefined {
  if (value === null || value === "") return null
  if (value === undefined) return undefined
  const parsed =
    typeof value === "number" ? value : Number(asTrimmedString(value))
  if (!Number.isFinite(parsed)) return undefined
  return Math.round(parsed * 100) / 100
}

export function parseUpsertStaffDailyLogBody(
  body: Record<string, unknown>
): ParseOk<UpsertStaffDailyLogInput> | ParseErr {
  const memberId = parseUuid(body.member_id)
  if (!memberId) {
    return { ok: false, error: "Select a team member.", status: 400 }
  }

  const logDate = parseIsoDate(body.log_date)
  if (!logDate) {
    return { ok: false, error: "Log date must be YYYY-MM-DD.", status: 400 }
  }

  const summary = asTrimmedString(body.summary)
  if (summary.length > 4000) {
    return {
      ok: false,
      error: "Summary must be 4000 characters or fewer.",
      status: 400,
    }
  }

  const hoursSpent = parseHoursSpent(body.hours_spent)
  if (hoursSpent === undefined) {
    return { ok: false, error: "Hours spent must be a number.", status: 400 }
  }
  if (hoursSpent != null && (hoursSpent < 0 || hoursSpent > 24)) {
    return {
      ok: false,
      error: "Hours spent must be between 0 and 24.",
      status: 400,
    }
  }

  return {
    ok: true,
    data: {
      member_id: memberId,
      log_date: logDate,
      summary,
      hours_spent: hoursSpent,
    },
  }
}
