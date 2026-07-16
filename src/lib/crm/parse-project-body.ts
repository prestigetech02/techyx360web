import {
  normalizeProjectPriorityInput,
  normalizeProjectStatusInput,
  type ProjectPriorityDb,
  type ProjectStatusDb,
} from "@/lib/crm/project-types"

type ParseOk<T> = { ok: true; data: T }
type ParseErr = { ok: false; error: string; status: number }

export type CreateProjectInput = {
  client_id: string
  name: string
  category: string
  description: string
  status: ProjectStatusDb
  priority: ProjectPriorityDb
  progress: number
  start_date: string | null
  due_date: string | null
  team_initials: string[]
}

export type UpdateProjectInput = Partial<{
  client_id: string | null
  name: string
  category: string
  description: string
  status: ProjectStatusDb
  priority: ProjectPriorityDb
  progress: number
  start_date: string | null
  due_date: string | null
  team_initials: string[]
}>

export type CreateMilestoneInput = {
  title: string
  due_date: string | null
  done: boolean
}

export type UpdateMilestoneInput = Partial<{
  title: string
  due_date: string | null
  done: boolean
  sort_order: number
}>

export type CreateTaskInput = {
  title: string
  assignee: string
  done: boolean
}

export type UpdateTaskInput = Partial<{
  title: string
  assignee: string
  done: boolean
  sort_order: number
}>

function asTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
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

function parseProgress(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value)
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return Math.round(parsed)
  }
  return null
}

function parseTeamInitials(value: unknown): string[] | null {
  if (value === undefined) return null
  if (!Array.isArray(value)) {
    if (typeof value === "string") {
      return value
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => part.slice(0, 3).toUpperCase())
    }
    return null
  }

  return value
    .map((item) => asTrimmedString(item).slice(0, 3).toUpperCase())
    .filter(Boolean)
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

export function parseCreateProjectBody(
  body: Record<string, unknown>
): ParseOk<CreateProjectInput> | ParseErr {
  const client_id = parseUuid(body.client_id ?? body.clientId)
  const name = asTrimmedString(body.name)
  const category = asTrimmedString(body.category) || "General"
  const description = asTrimmedString(body.description)
  const status =
    normalizeProjectStatusInput(asTrimmedString(body.status) || "in_progress") ??
    null
  const priority =
    normalizeProjectPriorityInput(
      asTrimmedString(body.priority) || "medium"
    ) ?? null
  const progress = parseProgress(body.progress)
  const start_date = parseIsoDate(body.start_date ?? body.startDate)
  const due_date = parseIsoDate(body.due_date ?? body.dueDate)
  const team_initials =
    parseTeamInitials(body.team_initials ?? body.teamInitials ?? body.team) ??
    []

  if (!client_id) {
    return { ok: false, error: "A valid client is required.", status: 400 }
  }

  if (!name) {
    return { ok: false, error: "Project name is required.", status: 400 }
  }

  if (!status) {
    return { ok: false, error: "Invalid project status.", status: 400 }
  }

  if (!priority) {
    return { ok: false, error: "Invalid project priority.", status: 400 }
  }

  if (progress === null || progress < 0 || progress > 100) {
    return {
      ok: false,
      error: "Progress must be between 0 and 100.",
      status: 400,
    }
  }

  if (start_date === undefined) {
    return { ok: false, error: "Invalid start date.", status: 400 }
  }

  if (due_date === undefined) {
    return { ok: false, error: "Invalid due date.", status: 400 }
  }

  return {
    ok: true,
    data: {
      client_id,
      name,
      category,
      description,
      status,
      priority,
      progress,
      start_date,
      due_date,
      team_initials,
    },
  }
}

export function parseUpdateProjectBody(
  body: Record<string, unknown>
): ParseOk<UpdateProjectInput> | ParseErr {
  const data: UpdateProjectInput = {}

  if (body.client_id !== undefined || body.clientId !== undefined) {
    const raw = body.client_id ?? body.clientId
    if (raw === null || raw === "") {
      data.client_id = null
    } else {
      const client_id = parseUuid(raw)
      if (!client_id) {
        return { ok: false, error: "Invalid client id.", status: 400 }
      }
      data.client_id = client_id
    }
  }

  if (body.name !== undefined) {
    const name = asTrimmedString(body.name)
    if (!name) {
      return { ok: false, error: "Project name cannot be empty.", status: 400 }
    }
    data.name = name
  }

  if (body.category !== undefined) {
    data.category = asTrimmedString(body.category) || "General"
  }

  if (body.description !== undefined) {
    data.description = asTrimmedString(body.description)
  }

  if (body.status !== undefined) {
    const status = normalizeProjectStatusInput(asTrimmedString(body.status))
    if (!status) {
      return { ok: false, error: "Invalid project status.", status: 400 }
    }
    data.status = status
  }

  if (body.priority !== undefined) {
    const priority = normalizeProjectPriorityInput(
      asTrimmedString(body.priority)
    )
    if (!priority) {
      return { ok: false, error: "Invalid project priority.", status: 400 }
    }
    data.priority = priority
  }

  if (body.progress !== undefined) {
    const progress = parseProgress(body.progress)
    if (progress === null || progress < 0 || progress > 100) {
      return {
        ok: false,
        error: "Progress must be between 0 and 100.",
        status: 400,
      }
    }
    data.progress = progress
  }

  if (body.start_date !== undefined || body.startDate !== undefined) {
    const start_date = parseIsoDate(body.start_date ?? body.startDate)
    if (start_date === undefined) {
      return { ok: false, error: "Invalid start date.", status: 400 }
    }
    data.start_date = start_date
  }

  if (body.due_date !== undefined || body.dueDate !== undefined) {
    const due_date = parseIsoDate(body.due_date ?? body.dueDate)
    if (due_date === undefined) {
      return { ok: false, error: "Invalid due date.", status: 400 }
    }
    data.due_date = due_date
  }

  if (
    body.team_initials !== undefined ||
    body.teamInitials !== undefined ||
    body.team !== undefined
  ) {
    const team_initials = parseTeamInitials(
      body.team_initials ?? body.teamInitials ?? body.team
    )
    if (team_initials === null) {
      return { ok: false, error: "Invalid team initials.", status: 400 }
    }
    data.team_initials = team_initials
  }

  if (Object.keys(data).length === 0) {
    return { ok: false, error: "No valid fields to update.", status: 400 }
  }

  return { ok: true, data }
}

export function parseCreateMilestoneBody(
  body: Record<string, unknown>
): ParseOk<CreateMilestoneInput> | ParseErr {
  const title = asTrimmedString(body.title)
  const due_date = parseIsoDate(body.due_date ?? body.dueDate ?? body.date)
  const done = body.done === true

  if (!title) {
    return { ok: false, error: "Milestone title is required.", status: 400 }
  }

  if (due_date === undefined) {
    return { ok: false, error: "Invalid milestone date.", status: 400 }
  }

  return {
    ok: true,
    data: {
      title,
      due_date,
      done,
    },
  }
}

export function parseUpdateMilestoneBody(
  body: Record<string, unknown>
): ParseOk<UpdateMilestoneInput> | ParseErr {
  const data: UpdateMilestoneInput = {}

  if (body.title !== undefined) {
    const title = asTrimmedString(body.title)
    if (!title) {
      return { ok: false, error: "Milestone title cannot be empty.", status: 400 }
    }
    data.title = title
  }

  if (
    body.due_date !== undefined ||
    body.dueDate !== undefined ||
    body.date !== undefined
  ) {
    const due_date = parseIsoDate(body.due_date ?? body.dueDate ?? body.date)
    if (due_date === undefined) {
      return { ok: false, error: "Invalid milestone date.", status: 400 }
    }
    data.due_date = due_date
  }

  if (body.done !== undefined) {
    if (typeof body.done !== "boolean") {
      return { ok: false, error: "Done must be a boolean.", status: 400 }
    }
    data.done = body.done
  }

  if (body.sort_order !== undefined || body.sortOrder !== undefined) {
    const raw = body.sort_order ?? body.sortOrder
    const sort_order =
      typeof raw === "number"
        ? raw
        : typeof raw === "string"
          ? Number(raw)
          : NaN
    if (!Number.isFinite(sort_order)) {
      return { ok: false, error: "Invalid sort order.", status: 400 }
    }
    data.sort_order = Math.round(sort_order)
  }

  if (Object.keys(data).length === 0) {
    return { ok: false, error: "No valid fields to update.", status: 400 }
  }

  return { ok: true, data }
}

export function parseCreateTaskBody(
  body: Record<string, unknown>
): ParseOk<CreateTaskInput> | ParseErr {
  const title = asTrimmedString(body.title)
  const assignee = asTrimmedString(body.assignee) || "Unassigned"
  const done = body.done === true

  if (!title) {
    return { ok: false, error: "Task title is required.", status: 400 }
  }

  return {
    ok: true,
    data: {
      title,
      assignee,
      done,
    },
  }
}

export function parseUpdateTaskBody(
  body: Record<string, unknown>
): ParseOk<UpdateTaskInput> | ParseErr {
  const data: UpdateTaskInput = {}

  if (body.title !== undefined) {
    const title = asTrimmedString(body.title)
    if (!title) {
      return { ok: false, error: "Task title cannot be empty.", status: 400 }
    }
    data.title = title
  }

  if (body.assignee !== undefined) {
    data.assignee = asTrimmedString(body.assignee) || "Unassigned"
  }

  if (body.done !== undefined) {
    if (typeof body.done !== "boolean") {
      return { ok: false, error: "Done must be a boolean.", status: 400 }
    }
    data.done = body.done
  }

  if (body.sort_order !== undefined || body.sortOrder !== undefined) {
    const raw = body.sort_order ?? body.sortOrder
    const sort_order =
      typeof raw === "number"
        ? raw
        : typeof raw === "string"
          ? Number(raw)
          : NaN
    if (!Number.isFinite(sort_order)) {
      return { ok: false, error: "Invalid sort order.", status: 400 }
    }
    data.sort_order = Math.round(sort_order)
  }

  if (Object.keys(data).length === 0) {
    return { ok: false, error: "No valid fields to update.", status: 400 }
  }

  return { ok: true, data }
}
