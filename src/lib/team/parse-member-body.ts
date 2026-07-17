import {
  isDocumentType,
  isPaymentFrequency,
  isSalaryCurrency,
  isStaffGender,
  isStaffRole,
  isStaffStatus,
  type DocumentType,
  type PaymentFrequency,
  type SalaryCurrency,
  type StaffGender,
  type StaffRole,
  type StaffStatus,
} from "@/lib/team/team-types"

type ParseOk<T> = { ok: true; data: T }
type ParseErr = { ok: false; error: string; status: number }

export type TeamMemberDocumentInput = {
  title: string
  doc_type: DocumentType
  notes: string
}

export type CreateTeamMemberInput = {
  full_name: string
  email: string
  phone: string
  role: StaffRole
  department: string
  status: StaffStatus
  joined_at: string
  gender: StaffGender | null
  address: string
  date_of_birth: string | null
  base_salary: number | null
  salary_currency: SalaryCurrency
  payment_frequency: PaymentFrequency | null
  bank_name: string
  account_name: string
  account_number: string
  documents: TeamMemberDocumentInput[]
}

export type UpdateTeamMemberInput = Partial<{
  full_name: string
  email: string
  phone: string
  role: StaffRole
  department: string
  status: StaffStatus
  joined_at: string
  gender: StaffGender | null
  address: string
  date_of_birth: string | null
  base_salary: number | null
  salary_currency: SalaryCurrency
  payment_frequency: PaymentFrequency | null
  bank_name: string
  account_name: string
  account_number: string
}>

function asTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
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

function parseOptionalSalary(value: unknown): ParseOk<number | null> | ParseErr {
  if (value === null || value === undefined || value === "") {
    return { ok: true, data: null }
  }

  const amount =
    typeof value === "number" ? value : Number(asTrimmedString(value))

  if (!Number.isFinite(amount) || amount < 0) {
    return {
      ok: false,
      error: "Base salary must be a valid non-negative number.",
      status: 400,
    }
  }

  return { ok: true, data: amount }
}

function parseGender(value: unknown): ParseOk<StaffGender | null> | ParseErr {
  if (value === null || value === undefined || value === "") {
    return { ok: true, data: null }
  }
  const gender = asTrimmedString(value)
  if (!isStaffGender(gender)) {
    return { ok: false, error: "Invalid gender.", status: 400 }
  }
  return { ok: true, data: gender }
}

function parsePaymentFrequency(
  value: unknown
): ParseOk<PaymentFrequency | null> | ParseErr {
  if (value === null || value === undefined || value === "") {
    return { ok: true, data: null }
  }
  const frequency = asTrimmedString(value)
  if (!isPaymentFrequency(frequency)) {
    return { ok: false, error: "Invalid payment frequency.", status: 400 }
  }
  return { ok: true, data: frequency }
}

function parseDocuments(
  value: unknown
): ParseOk<TeamMemberDocumentInput[]> | ParseErr {
  if (value === undefined || value === null) {
    return { ok: true, data: [] }
  }

  if (!Array.isArray(value)) {
    return { ok: false, error: "Documents must be an array.", status: 400 }
  }

  const documents: TeamMemberDocumentInput[] = []

  for (const entry of value) {
    if (!entry || typeof entry !== "object") {
      return { ok: false, error: "Invalid document entry.", status: 400 }
    }

    const record = entry as Record<string, unknown>
    const title = asTrimmedString(record.title)
    const docTypeRaw = asTrimmedString(record.doc_type ?? record.docType) || "Other"
    const notes = asTrimmedString(record.notes)

    if (!title) {
      return {
        ok: false,
        error: "Each document needs a title.",
        status: 400,
      }
    }

    if (!isDocumentType(docTypeRaw)) {
      return { ok: false, error: "Invalid document type.", status: 400 }
    }

    documents.push({
      title,
      doc_type: docTypeRaw,
      notes,
    })
  }

  return { ok: true, data: documents }
}

export function parseCreateDocumentBody(
  body: Record<string, unknown>
): ParseOk<TeamMemberDocumentInput> | ParseErr {
  const title = asTrimmedString(body.title)
  const docTypeRaw = asTrimmedString(body.doc_type ?? body.docType) || "Other"
  const notes = asTrimmedString(body.notes)

  if (!title) {
    return { ok: false, error: "Document title is required.", status: 400 }
  }

  if (!isDocumentType(docTypeRaw)) {
    return { ok: false, error: "Invalid document type.", status: 400 }
  }

  return {
    ok: true,
    data: {
      title,
      doc_type: docTypeRaw,
      notes,
    },
  }
}

function parseSharedProfileFields(body: Record<string, unknown>):
  | ParseOk<{
      gender: StaffGender | null
      address: string
      date_of_birth: string | null
      base_salary: number | null
      salary_currency: SalaryCurrency
      payment_frequency: PaymentFrequency | null
      bank_name: string
      account_name: string
      account_number: string
    }>
  | ParseErr {
  const genderParsed = parseGender(body.gender)
  if (!genderParsed.ok) return genderParsed

  const dobParsed = parseOptionalDate(
    body.date_of_birth ?? body.dateOfBirth,
    "Date of birth"
  )
  if (!dobParsed.ok) return dobParsed

  const salaryParsed = parseOptionalSalary(
    body.base_salary ?? body.baseSalary
  )
  if (!salaryParsed.ok) return salaryParsed

  const currencyRaw =
    asTrimmedString(body.salary_currency ?? body.salaryCurrency) || "NGN"
  if (!isSalaryCurrency(currencyRaw)) {
    return { ok: false, error: "Invalid salary currency.", status: 400 }
  }

  const frequencyParsed = parsePaymentFrequency(
    body.payment_frequency ?? body.paymentFrequency
  )
  if (!frequencyParsed.ok) return frequencyParsed

  return {
    ok: true,
    data: {
      gender: genderParsed.data,
      address: asTrimmedString(body.address),
      date_of_birth: dobParsed.data,
      base_salary: salaryParsed.data,
      salary_currency: currencyRaw,
      payment_frequency: frequencyParsed.data,
      bank_name: asTrimmedString(body.bank_name ?? body.bankName),
      account_name: asTrimmedString(body.account_name ?? body.accountName),
      account_number: asTrimmedString(
        body.account_number ?? body.accountNumber
      ),
    },
  }
}

export function parseCreateTeamMemberBody(
  body: Record<string, unknown>
): ParseOk<CreateTeamMemberInput> | ParseErr {
  const full_name = asTrimmedString(body.full_name ?? body.fullName)
  const email = asTrimmedString(body.email)
  const phone = asTrimmedString(body.phone)
  const roleRaw = asTrimmedString(body.role) || "Engineer"
  const department = asTrimmedString(body.department)
  const statusRaw = asTrimmedString(body.status).toLowerCase() || "active"
  const joinedRaw = asTrimmedString(body.joined_at ?? body.joinedAt)
  const joined_at = joinedRaw || todayIsoDate()

  if (!full_name || !email || !department) {
    return {
      ok: false,
      error: "Name, email, and department are required.",
      status: 400,
    }
  }

  if (!email.includes("@")) {
    return { ok: false, error: "A valid email is required.", status: 400 }
  }

  if (!isStaffRole(roleRaw)) {
    return { ok: false, error: "Invalid team role.", status: 400 }
  }

  if (!isStaffStatus(statusRaw)) {
    return { ok: false, error: "Invalid team member status.", status: 400 }
  }

  if (!isIsoDate(joined_at)) {
    return {
      ok: false,
      error: "Joined date must be YYYY-MM-DD.",
      status: 400,
    }
  }

  const profile = parseSharedProfileFields(body)
  if (!profile.ok) return profile

  const documents = parseDocuments(body.documents)
  if (!documents.ok) return documents

  return {
    ok: true,
    data: {
      full_name,
      email,
      phone,
      role: roleRaw,
      department,
      status: statusRaw,
      joined_at,
      ...profile.data,
      documents: documents.data,
    },
  }
}

export function parseUpdateTeamMemberBody(
  body: Record<string, unknown>
): ParseOk<UpdateTeamMemberInput> | ParseErr {
  const data: UpdateTeamMemberInput = {}

  if (body.full_name !== undefined || body.fullName !== undefined) {
    const full_name = asTrimmedString(body.full_name ?? body.fullName)
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
    data.phone = asTrimmedString(body.phone)
  }

  if (body.role !== undefined) {
    const role = asTrimmedString(body.role)
    if (!isStaffRole(role)) {
      return { ok: false, error: "Invalid team role.", status: 400 }
    }
    data.role = role
  }

  if (body.department !== undefined) {
    const department = asTrimmedString(body.department)
    if (!department) {
      return { ok: false, error: "Department cannot be empty.", status: 400 }
    }
    data.department = department
  }

  if (body.status !== undefined) {
    const status = asTrimmedString(body.status).toLowerCase()
    if (!isStaffStatus(status)) {
      return { ok: false, error: "Invalid team member status.", status: 400 }
    }
    data.status = status
  }

  if (body.joined_at !== undefined || body.joinedAt !== undefined) {
    const joined_at = asTrimmedString(body.joined_at ?? body.joinedAt)
    if (!isIsoDate(joined_at)) {
      return {
        ok: false,
        error: "Joined date must be YYYY-MM-DD.",
        status: 400,
      }
    }
    data.joined_at = joined_at
  }

  if (body.gender !== undefined) {
    const genderParsed = parseGender(body.gender)
    if (!genderParsed.ok) return genderParsed
    data.gender = genderParsed.data
  }

  if (body.address !== undefined) {
    data.address = asTrimmedString(body.address)
  }

  if (body.date_of_birth !== undefined || body.dateOfBirth !== undefined) {
    const dobParsed = parseOptionalDate(
      body.date_of_birth ?? body.dateOfBirth,
      "Date of birth"
    )
    if (!dobParsed.ok) return dobParsed
    data.date_of_birth = dobParsed.data
  }

  if (body.base_salary !== undefined || body.baseSalary !== undefined) {
    const salaryParsed = parseOptionalSalary(
      body.base_salary ?? body.baseSalary
    )
    if (!salaryParsed.ok) return salaryParsed
    data.base_salary = salaryParsed.data
  }

  if (
    body.salary_currency !== undefined ||
    body.salaryCurrency !== undefined
  ) {
    const currency = asTrimmedString(
      body.salary_currency ?? body.salaryCurrency
    )
    if (!isSalaryCurrency(currency)) {
      return { ok: false, error: "Invalid salary currency.", status: 400 }
    }
    data.salary_currency = currency
  }

  if (
    body.payment_frequency !== undefined ||
    body.paymentFrequency !== undefined
  ) {
    const frequencyParsed = parsePaymentFrequency(
      body.payment_frequency ?? body.paymentFrequency
    )
    if (!frequencyParsed.ok) return frequencyParsed
    data.payment_frequency = frequencyParsed.data
  }

  if (body.bank_name !== undefined || body.bankName !== undefined) {
    data.bank_name = asTrimmedString(body.bank_name ?? body.bankName)
  }

  if (body.account_name !== undefined || body.accountName !== undefined) {
    data.account_name = asTrimmedString(body.account_name ?? body.accountName)
  }

  if (
    body.account_number !== undefined ||
    body.accountNumber !== undefined
  ) {
    data.account_number = asTrimmedString(
      body.account_number ?? body.accountNumber
    )
  }

  if (Object.keys(data).length === 0) {
    return { ok: false, error: "No valid fields to update.", status: 400 }
  }

  return { ok: true, data }
}
