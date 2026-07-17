export type StaffStatus = "active" | "on_leave" | "inactive"

export type StaffRole =
  | "Engineer"
  | "Designer"
  | "Project Manager"
  | "Operations"
  | "Leadership"
  | "Other"

export type StaffGender =
  | "Male"
  | "Female"
  | "Non-binary"
  | "Prefer not to say"

export type PaymentFrequency = "Monthly" | "Bi-weekly" | "Weekly" | "Annual"

export type SalaryCurrency = "NGN" | "USD" | "GBP" | "EUR"

export type DocumentType =
  | "Contract"
  | "ID"
  | "CV"
  | "Certificate"
  | "Offer letter"
  | "Other"

export type TeamMemberDocumentView = {
  id: string
  title: string
  docType: DocumentType
  notes: string
  createdAt: string
}

export type TeamMemberView = {
  id: string
  fullName: string
  email: string
  phone: string
  role: StaffRole
  department: string
  status: StaffStatus
  joinedAt: string
  gender: StaffGender | null
  address: string
  dateOfBirth: string | null
  baseSalary: number | null
  salaryCurrency: SalaryCurrency
  paymentFrequency: PaymentFrequency | null
  bankName: string
  accountName: string
  accountNumber: string
  documents: TeamMemberDocumentView[]
  initials: string
  accent: string
  createdAt: string
  updatedAt: string
}

export const STAFF_STATUSES = new Set<StaffStatus>([
  "active",
  "on_leave",
  "inactive",
])

export const STAFF_ROLES = [
  "Engineer",
  "Designer",
  "Project Manager",
  "Operations",
  "Leadership",
  "Other",
] as const

export const STAFF_GENDERS = [
  "Male",
  "Female",
  "Non-binary",
  "Prefer not to say",
] as const

export const PAYMENT_FREQUENCIES = [
  "Monthly",
  "Bi-weekly",
  "Weekly",
  "Annual",
] as const

export const SALARY_CURRENCIES = ["NGN", "USD", "GBP", "EUR"] as const

export const DOCUMENT_TYPES = [
  "Contract",
  "ID",
  "CV",
  "Certificate",
  "Offer letter",
  "Other",
] as const

const ACCENT_CLASSES = [
  "bg-blue-600 text-white",
  "bg-violet-600 text-white",
  "bg-emerald-600 text-white",
  "bg-rose-600 text-white",
  "bg-amber-600 text-white",
  "bg-sky-600 text-white",
]

export function getStaffInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "T"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
}

export function getStaffAccentClass(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % ACCENT_CLASSES.length
  }
  return ACCENT_CLASSES[hash] ?? ACCENT_CLASSES[0]
}

export function isStaffStatus(value: string): value is StaffStatus {
  return STAFF_STATUSES.has(value as StaffStatus)
}

export function isStaffRole(value: string): value is StaffRole {
  return (STAFF_ROLES as readonly string[]).includes(value)
}

export function isStaffGender(value: string): value is StaffGender {
  return (STAFF_GENDERS as readonly string[]).includes(value)
}

export function isPaymentFrequency(value: string): value is PaymentFrequency {
  return (PAYMENT_FREQUENCIES as readonly string[]).includes(value)
}

export function isSalaryCurrency(value: string): value is SalaryCurrency {
  return (SALARY_CURRENCIES as readonly string[]).includes(value)
}

export function isDocumentType(value: string): value is DocumentType {
  return (DOCUMENT_TYPES as readonly string[]).includes(value)
}

export function formatSalaryAmount(
  amount: number | null,
  currency: SalaryCurrency
) {
  if (amount == null || Number.isNaN(amount)) return "—"
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}

export function getAgeFromDateOfBirth(dateOfBirth: string | null) {
  if (!dateOfBirth) return null
  const birth = new Date(`${dateOfBirth}T00:00:00`)
  if (Number.isNaN(birth.getTime())) return null

  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age -= 1
  }
  return age >= 0 ? age : null
}

export function getNextBirthdayLabel(dateOfBirth: string | null) {
  if (!dateOfBirth) return null
  const birth = new Date(`${dateOfBirth}T00:00:00`)
  if (Number.isNaN(birth.getTime())) return null

  const today = new Date()
  const next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
  if (next < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    next.setFullYear(today.getFullYear() + 1)
  }

  return next.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}
