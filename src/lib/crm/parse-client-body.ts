import {
  CLIENT_COMPANY_SIZES,
  CLIENT_STATUSES,
  type ClientStatus,
} from "@/lib/crm/client-types"

type ParseOk<T> = { ok: true; data: T }
type ParseErr = { ok: false; error: string; status: number }

export type CreateClientInput = {
  company: string
  contact_name: string
  email: string
  phone: string
  industry: string
  product: string
  role: string
  website: string | null
  location: string
  company_size: string
  status: ClientStatus
  note: string | null
}

export type UpdateClientInput = Partial<{
  company: string
  contact_name: string
  email: string
  phone: string
  industry: string
  product: string
  role: string
  website: string | null
  location: string
  company_size: string
  status: ClientStatus
  avatar_url: string | null
}>

function asTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function normalizeWebsite(value: unknown): string | null {
  const raw = asTrimmedString(value).replace(/^https?:\/\//i, "")
  return raw || null
}

function isAllowedCompanySize(size: string) {
  return (CLIENT_COMPANY_SIZES as readonly string[]).includes(size)
}

export function parseCreateClientBody(
  body: Record<string, unknown>
): ParseOk<CreateClientInput> | ParseErr {
  const company = asTrimmedString(body.company)
  const contact_name = asTrimmedString(body.contact_name ?? body.contact)
  const email = asTrimmedString(body.email)
  const phone = asTrimmedString(body.phone)
  const industry = asTrimmedString(body.industry) || "General"
  const product = asTrimmedString(body.product) || "Custom software"
  const role = asTrimmedString(body.role) || "Contact"
  const website = normalizeWebsite(body.website)
  const location = asTrimmedString(body.location) || "Nigeria"
  const company_size =
    asTrimmedString(body.company_size ?? body.companySize) ||
    "11 - 50 employees"
  const statusRaw = asTrimmedString(body.status).toLowerCase() || "active"
  const note = asTrimmedString(body.note ?? body.initial_note) || null

  if (!company || !contact_name || !email || !phone) {
    return {
      ok: false,
      error: "Company, contact person, email, and phone are required.",
      status: 400,
    }
  }

  if (!email.includes("@")) {
    return { ok: false, error: "A valid email is required.", status: 400 }
  }

  if (!isAllowedCompanySize(company_size)) {
    return { ok: false, error: "Invalid company size.", status: 400 }
  }

  if (!CLIENT_STATUSES.has(statusRaw as ClientStatus)) {
    return { ok: false, error: "Invalid client status.", status: 400 }
  }

  return {
    ok: true,
    data: {
      company,
      contact_name,
      email,
      phone,
      industry,
      product,
      role,
      website,
      location,
      company_size,
      status: statusRaw as ClientStatus,
      note,
    },
  }
}

export function parseUpdateClientBody(
  body: Record<string, unknown>
): ParseOk<UpdateClientInput> | ParseErr {
  const data: UpdateClientInput = {}

  if (body.company !== undefined) {
    const company = asTrimmedString(body.company)
    if (!company) {
      return { ok: false, error: "Company cannot be empty.", status: 400 }
    }
    data.company = company
  }

  if (body.contact_name !== undefined || body.contact !== undefined) {
    const contact_name = asTrimmedString(body.contact_name ?? body.contact)
    if (!contact_name) {
      return {
        ok: false,
        error: "Contact person cannot be empty.",
        status: 400,
      }
    }
    data.contact_name = contact_name
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

  if (body.industry !== undefined) {
    data.industry = asTrimmedString(body.industry) || "General"
  }

  if (body.product !== undefined) {
    data.product = asTrimmedString(body.product) || "Custom software"
  }

  if (body.role !== undefined) {
    data.role = asTrimmedString(body.role) || "Contact"
  }

  if (body.website !== undefined) {
    data.website = normalizeWebsite(body.website)
  }

  if (body.location !== undefined) {
    data.location = asTrimmedString(body.location) || "Nigeria"
  }

  if (body.company_size !== undefined || body.companySize !== undefined) {
    const company_size = asTrimmedString(body.company_size ?? body.companySize)
    if (!isAllowedCompanySize(company_size)) {
      return { ok: false, error: "Invalid company size.", status: 400 }
    }
    data.company_size = company_size
  }

  if (body.status !== undefined) {
    const status = asTrimmedString(body.status).toLowerCase()
    if (!CLIENT_STATUSES.has(status as ClientStatus)) {
      return { ok: false, error: "Invalid client status.", status: 400 }
    }
    data.status = status as ClientStatus
  }

  if (body.avatar_url !== undefined || body.avatarUrl !== undefined) {
    const raw = body.avatar_url ?? body.avatarUrl
    if (raw === null || raw === "") {
      data.avatar_url = null
    } else {
      const avatar_url = asTrimmedString(raw)
      if (!avatar_url) {
        data.avatar_url = null
      } else if (
        !avatar_url.startsWith("https://") &&
        !avatar_url.startsWith("http://")
      ) {
        return { ok: false, error: "Invalid avatar URL.", status: 400 }
      } else {
        data.avatar_url = avatar_url
      }
    }
  }

  if (Object.keys(data).length === 0) {
    return { ok: false, error: "No valid fields to update.", status: 400 }
  }

  return { ok: true, data }
}
