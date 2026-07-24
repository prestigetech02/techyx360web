import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  isSocialLeadSource,
  type LeadStatus,
} from "@/lib/crm/lead-types"

type ParseOk<T> = { ok: true; data: T }
type ParseErr = { ok: false; error: string; status: number }

export type CreateLeadInput = {
  full_name: string
  email: string
  phone: string
  company: string
  address: string
  source: string
  status: LeadStatus
  assigned_to: string | null
  score: number
  followers: number | null
  niche_hashtag: string
  gap_found: string
  profile_link: string | null
  contact_date: string | null
  opened: boolean | null
  replied: boolean | null
  follow_up_date: string | null
  note: string | null
}

export type UpdateLeadInput = Partial<{
  full_name: string
  email: string
  phone: string
  company: string
  address: string
  source: string
  status: LeadStatus
  assigned_to: string | null
  score: number
  followers: number | null
  niche_hashtag: string
  gap_found: string
  profile_link: string | null
  contact_date: string | null
  opened: boolean | null
  replied: boolean | null
  follow_up_date: string | null
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

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function parseOptionalDate(
  value: unknown,
  fieldLabel: string
): ParseOk<string | null> | ParseErr {
  if (value === null || value === undefined || value === "") {
    return { ok: true, data: null }
  }
  const date = asTrimmedString(value)
  if (!isIsoDate(date)) {
    return {
      ok: false,
      error: `${fieldLabel} must be YYYY-MM-DD.`,
      status: 400,
    }
  }
  return { ok: true, data: date }
}

function parseOptionalBoolean(
  value: unknown,
  fieldLabel: string
): ParseOk<boolean | null> | ParseErr {
  if (value === null || value === undefined || value === "") {
    return { ok: true, data: null }
  }
  if (typeof value === "boolean") {
    return { ok: true, data: value }
  }

  const normalized = asTrimmedString(value).toLowerCase()
  if (normalized === "yes" || normalized === "true") {
    return { ok: true, data: true }
  }
  if (normalized === "no" || normalized === "false") {
    return { ok: true, data: false }
  }

  return {
    ok: false,
    error: `${fieldLabel} must be Yes or No.`,
    status: 400,
  }
}

function parseOptionalFollowers(
  value: unknown,
  source: string
): ParseOk<number | null> | ParseErr {
  if (!isSocialLeadSource(source)) {
    return { ok: true, data: null }
  }

  if (value === null || value === undefined || value === "") {
    return { ok: true, data: null }
  }

  const followers =
    typeof value === "number" ? value : Number(asTrimmedString(value))

  if (!Number.isFinite(followers) || followers < 0) {
    return {
      ok: false,
      error: "Followers must be a valid non-negative number.",
      status: 400,
    }
  }

  return { ok: true, data: Math.round(followers) }
}

function parseOptionalUrl(value: unknown): ParseOk<string | null> | ParseErr {
  const raw = asTrimmedString(value)
  if (!raw) return { ok: true, data: null }

  if (
    !raw.startsWith("http://") &&
    !raw.startsWith("https://") &&
    !raw.startsWith("www.")
  ) {
    return {
      ok: false,
      error: "Profile link must be a valid URL.",
      status: 400,
    }
  }

  return { ok: true, data: raw }
}

function parseOutreachFields(
  body: Record<string, unknown>,
  source: string
):
  | ParseOk<{
      followers: number | null
      niche_hashtag: string
      gap_found: string
      profile_link: string | null
      contact_date: string | null
      opened: boolean | null
      replied: boolean | null
      follow_up_date: string | null
    }>
  | ParseErr {
  const followersParsed = parseOptionalFollowers(
    body.followers,
    source
  )
  if (!followersParsed.ok) return followersParsed

  const profileParsed = parseOptionalUrl(
    body.profile_link ?? body.profileLink
  )
  if (!profileParsed.ok) return profileParsed

  const contactDateParsed = parseOptionalDate(
    body.contact_date ?? body.contactDate,
    "DM/Email/Call date"
  )
  if (!contactDateParsed.ok) return contactDateParsed

  const followUpParsed = parseOptionalDate(
    body.follow_up_date ?? body.followUpDate,
    "Follow up date"
  )
  if (!followUpParsed.ok) return followUpParsed

  const openedParsed = parseOptionalBoolean(
    body.opened,
    "Opened"
  )
  if (!openedParsed.ok) return openedParsed

  const repliedParsed = parseOptionalBoolean(
    body.replied,
    "Replied"
  )
  if (!repliedParsed.ok) return repliedParsed

  return {
    ok: true,
    data: {
      followers: followersParsed.data,
      niche_hashtag: asTrimmedString(
        body.niche_hashtag ?? body.nicheHashtag
      ),
      gap_found: asTrimmedString(body.gap_found ?? body.gapFound),
      profile_link: profileParsed.data,
      contact_date: contactDateParsed.data,
      opened: openedParsed.data,
      replied: repliedParsed.data,
      follow_up_date: followUpParsed.data,
    },
  }
}

export function parseCreateLeadBody(
  body: Record<string, unknown>
): ParseOk<CreateLeadInput> | ParseErr {
  const full_name = asTrimmedString(body.full_name ?? body.name)
  const email = asTrimmedString(body.email)
  const phone = asTrimmedString(body.phone)
  const company = asTrimmedString(body.company)
  const address = asTrimmedString(body.address)
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

  const outreach = parseOutreachFields(body, source)
  if (!outreach.ok) return outreach

  return {
    ok: true,
    data: {
      full_name,
      email,
      phone,
      company,
      address,
      source,
      status: statusRaw as LeadStatus,
      assigned_to: assignedRaw || null,
      score,
      ...outreach.data,
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

  if (body.address !== undefined) {
    data.address = asTrimmedString(body.address)
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

  const sourceForFollowers =
    data.source ??
    (typeof body.source === "string" ? body.source.trim() : "")

  const hasOutreachField =
    body.followers !== undefined ||
    body.niche_hashtag !== undefined ||
    body.nicheHashtag !== undefined ||
    body.gap_found !== undefined ||
    body.gapFound !== undefined ||
    body.profile_link !== undefined ||
    body.profileLink !== undefined ||
    body.contact_date !== undefined ||
    body.contactDate !== undefined ||
    body.opened !== undefined ||
    body.replied !== undefined ||
    body.follow_up_date !== undefined ||
    body.followUpDate !== undefined

  if (hasOutreachField) {
    const outreach = parseOutreachFields(
      body,
      sourceForFollowers || "Website Form"
    )
    if (!outreach.ok) return outreach
    Object.assign(data, outreach.data)
  }

  if (Object.keys(data).length === 0) {
    return { ok: false, error: "No valid fields to update.", status: 400 }
  }

  return { ok: true, data }
}
