import {
  isStaffTaskPriority,
  isStaffTaskStatus,
  type StaffTaskPriority,
  type StaffTaskStatus,
} from "@/lib/work/task-types"

type ParseOk<T> = { ok: true; data: T }
type ParseErr = { ok: false; error: string; status: number }

export type CreateStaffTaskInput = {
  title: string
  notes: string
  assignee_id: string | null
  status: StaffTaskStatus
  priority: StaffTaskPriority
  scheduled_on: string | null
  sort_order: number
}

export type UpdateStaffTaskInput = Partial<{
  title: string
  notes: string
  assignee_id: string | null
  status: StaffTaskStatus
  priority: StaffTaskPriority
  scheduled_on: string | null
  sort_order: number
}>

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

function parseIsoDate(value: unknown): string | null | undefined {
  if (value === null) return null
  if (value === undefined) return undefined
  const raw = asTrimmedString(value)
  if (!raw) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return undefined
  }
  const date = new Date(`${raw}T00:00:00`)
  if (Number.isNaN(date.getTime())) return undefined
  return raw
}

function parseSortOrder(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value)
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return Math.trunc(parsed)
  }
  return null
}

function parseOptionalAssigneeId(
  value: unknown
): { ok: true; id: string | null } | { ok: false } {
  if (value === null || value === undefined) {
    return { ok: true, id: null }
  }
  const raw = asTrimmedString(value)
  if (!raw) return { ok: true, id: null }
  const id = parseUuid(raw)
  if (!id) return { ok: false }
  return { ok: true, id }
}

export function parseCreateStaffTaskBody(
  body: Record<string, unknown>
): ParseOk<CreateStaffTaskInput> | ParseErr {
  const title = asTrimmedString(body.title)
  if (!title) {
    return { ok: false, error: "Title is required.", status: 400 }
  }
  if (title.length > 200) {
    return {
      ok: false,
      error: "Title must be 200 characters or fewer.",
      status: 400,
    }
  }

  const notes = asTrimmedString(body.notes)
  if (notes.length > 4000) {
    return {
      ok: false,
      error: "Notes must be 4000 characters or fewer.",
      status: 400,
    }
  }

  const assignee = parseOptionalAssigneeId(body.assignee_id)
  if (!assignee.ok) {
    return { ok: false, error: "Select a valid team member.", status: 400 }
  }

  const statusRaw = asTrimmedString(body.status) || "todo"
  if (!isStaffTaskStatus(statusRaw)) {
    return { ok: false, error: "Select a valid status.", status: 400 }
  }

  const priorityRaw = asTrimmedString(body.priority) || "medium"
  if (!isStaffTaskPriority(priorityRaw)) {
    return { ok: false, error: "Select a valid priority.", status: 400 }
  }

  const scheduledOn = parseIsoDate(body.scheduled_on)
  if (scheduledOn === undefined) {
    return { ok: false, error: "Scheduled date must be YYYY-MM-DD.", status: 400 }
  }

  const sortOrder = parseSortOrder(body.sort_order)

  return {
    ok: true,
    data: {
      title,
      notes,
      assignee_id: assignee.id,
      status: statusRaw,
      priority: priorityRaw,
      scheduled_on: scheduledOn,
      sort_order: sortOrder ?? 0,
    },
  }
}

export function parseUpdateStaffTaskBody(
  body: Record<string, unknown>
): ParseOk<UpdateStaffTaskInput> | ParseErr {
  const data: UpdateStaffTaskInput = {}

  if (body.title !== undefined) {
    const title = asTrimmedString(body.title)
    if (!title) {
      return { ok: false, error: "Title is required.", status: 400 }
    }
    if (title.length > 200) {
      return {
        ok: false,
        error: "Title must be 200 characters or fewer.",
        status: 400,
      }
    }
    data.title = title
  }

  if (body.notes !== undefined) {
    const notes = asTrimmedString(body.notes)
    if (notes.length > 4000) {
      return {
        ok: false,
        error: "Notes must be 4000 characters or fewer.",
        status: 400,
      }
    }
    data.notes = notes
  }

  if (body.assignee_id !== undefined) {
    const assignee = parseOptionalAssigneeId(body.assignee_id)
    if (!assignee.ok) {
      return { ok: false, error: "Select a valid team member.", status: 400 }
    }
    data.assignee_id = assignee.id
  }

  if (body.status !== undefined) {
    const statusRaw = asTrimmedString(body.status)
    if (!isStaffTaskStatus(statusRaw)) {
      return { ok: false, error: "Select a valid status.", status: 400 }
    }
    data.status = statusRaw
  }

  if (body.priority !== undefined) {
    const priorityRaw = asTrimmedString(body.priority)
    if (!isStaffTaskPriority(priorityRaw)) {
      return { ok: false, error: "Select a valid priority.", status: 400 }
    }
    data.priority = priorityRaw
  }

  if (body.scheduled_on !== undefined) {
    const scheduledOn = parseIsoDate(body.scheduled_on)
    if (scheduledOn === undefined) {
      return {
        ok: false,
        error: "Scheduled date must be YYYY-MM-DD.",
        status: 400,
      }
    }
    data.scheduled_on = scheduledOn
  }

  if (body.sort_order !== undefined) {
    const sortOrder = parseSortOrder(body.sort_order)
    if (sortOrder == null) {
      return { ok: false, error: "Sort order must be a number.", status: 400 }
    }
    data.sort_order = sortOrder
  }

  if (Object.keys(data).length === 0) {
    return { ok: false, error: "No fields to update.", status: 400 }
  }

  return { ok: true, data }
}
