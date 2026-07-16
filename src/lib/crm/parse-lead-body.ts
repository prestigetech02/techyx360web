import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  type LeadStatus,
} from "@/lib/crm/lead-types"

type ParseOk<T> = { ok: true; data: T }
type ParseErr = { ok: false; error: string; status: number }

export type CreateLeadInput = {
  full_name: string
  email: string
  phone: string
  company: string
  source: string
  status: LeadStatus
  assigned_to: string | null
  score: number
  note: string | null
}

export type UpdateLeadInput = Partial<{
  full_name: string
  email: string
  phone: string
  company: string
  source: string
  status: LeadStatus
  assigned_to: string | null
  score: number
}>

function asTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function parseScore(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value)
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return Math.round(parsed)
  }
  return null
}

function isAllowedSource(source: string) {
  return (LEAD_SOURCES as readonly string[]).includes(source)
}

export function parseCreateLeadBody(
  body: Record<string, unknown>
): ParseOk<CreateLeadInput> | ParseErr {
  const full_name = asTrimmedString(body.full_name ?? body.name)
  const email = asTrimmedString(body.email)
  const phone = asTrimmedString(body.phone)
  const company = asTrimmedString(body.company)
  const source = asTrimmedString(body.source) || "Website Form"
  const statusRaw = asTrimmedString(body.status).toLowerCase() || "new"
  const assignedRaw = asTrimmedString(body.assigned_to ?? body.assignedTo)
  const noteRaw = asTrimmedString(body.note ?? body.initial_note)
  const score =
    body.score === undefined || body.score === null || body.score === ""
      ? 50
      : parseScore(body.score)

  if (!full_name || !email || !phone || !company) {
    return {
      ok: false,
      error: "Name, email, phone, and company are required.",
      status: 400,
    }
  }

  if (!email.includes("@")) {
    return { ok: false, error: "A valid email is required.", status: 400 }
  }

  if (!isAllowedSource(source)) {
    return { ok: false, error: "Invalid lead source.", status: 400 }
  }

  if (!LEAD_STATUSES.has(statusRaw as LeadStatus)) {
    return { ok: false, error: "Invalid lead status.", status: 400 }
  }

  if (score === null || score < 0 || score > 100) {
    return {
      ok: false,
      error: "Lead score must be between 0 and 100.",
      status: 400,
    }
  }

  return {
    ok: true,
    data: {
      full_name,
      email,
      phone,
      company,
      source,
      status: statusRaw as LeadStatus,
      assigned_to: assignedRaw || null,
      score,
      note: noteRaw || null,
    },
  }
}

export function parseUpdateLeadBody(
  body: Record<string, unknown>
): ParseOk<UpdateLeadInput> | ParseErr {
  const data: UpdateLeadInput = {}

  if (body.full_name !== undefined || body.name !== undefined) {
    const full_name = asTrimmedString(body.full_name ?? body.name)
    if (!full_name) {
      return { ok: false, error: "Name cannot be empty.", status: 400 }
    }
    data.full_name = full_name
  }

  if (body.email !== undefined) {
    const email = asTrimmedString(body.email)
    if (!email || !email.includes("@")) {
      return { ok: false, error: "A valid email is required.", status: 400 }
    }
    data.email = email
  }

  if (body.phone !== undefined) {
    const phone = asTrimmedString(body.phone)
    if (!phone) {
      return { ok: false, error: "Phone cannot be empty.", status: 400 }
    }
    data.phone = phone
  }

  if (body.company !== undefined) {
    const company = asTrimmedString(body.company)
    if (!company) {
      return { ok: false, error: "Company cannot be empty.", status: 400 }
    }
    data.company = company
  }

  if (body.source !== undefined) {
    const source = asTrimmedString(body.source)
    if (!isAllowedSource(source)) {
      return { ok: false, error: "Invalid lead source.", status: 400 }
    }
    data.source = source
  }

  if (body.status !== undefined) {
    const status = asTrimmedString(body.status).toLowerCase()
    if (!LEAD_STATUSES.has(status as LeadStatus)) {
      return { ok: false, error: "Invalid lead status.", status: 400 }
    }
    data.status = status as LeadStatus
  }

  if (body.assigned_to !== undefined || body.assignedTo !== undefined) {
    const assigned = asTrimmedString(body.assigned_to ?? body.assignedTo)
    data.assigned_to = assigned || null
  }

  if (body.score !== undefined) {
    const score = parseScore(body.score)
    if (score === null || score < 0 || score > 100) {
      return {
        ok: false,
        error: "Lead score must be between 0 and 100.",
        status: 400,
      }
    }
    data.score = score
  }

  if (Object.keys(data).length === 0) {
    return { ok: false, error: "No valid fields to update.", status: 400 }
  }

  return { ok: true, data }
}
