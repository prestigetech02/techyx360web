export type PaymentDirection = "inbound" | "outbound"
export type PaymentMethod = "bank_transfer" | "card" | "cash" | "other"
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded"
export type PaymentPurpose =
  | "hosting"
  | "domain"
  | "web_development"
  | "app_development"
  | "ssl"
  | "pif"
  | "training"
  | "design"
  | "others"

export type PaymentMethodLabel =
  | "Bank transfer"
  | "Card"
  | "Cash"
  | "Other"

export type PaymentStatusLabel =
  | "Pending"
  | "Completed"
  | "Failed"
  | "Refunded"

export type PaymentPurposeLabel =
  | "Hosting"
  | "Domain"
  | "Web development"
  | "App development"
  | "SSL"
  | "PIF"
  | "Training"
  | "Design"
  | "Others"

export type PaymentView = {
  id: string
  clientId: string | null
  clientName: string | null
  invoiceId: string | null
  invoiceNumber: string | null
  dealId: string | null
  dealTitle: string | null
  amount: number
  currency: string
  direction: PaymentDirection
  method: PaymentMethod
  methodLabel: PaymentMethodLabel
  status: PaymentStatus
  statusLabel: PaymentStatusLabel
  purpose: PaymentPurpose
  purposeLabel: PaymentPurposeLabel
  paidAt: string
  paidAtLabel: string
  reference: string
  description: string
  notes: string
  createdAt: string
  updatedAt: string
}

export const PAYMENT_METHODS = new Set<PaymentMethod>([
  "bank_transfer",
  "card",
  "cash",
  "other",
])

export const PAYMENT_STATUSES = new Set<PaymentStatus>([
  "pending",
  "completed",
  "failed",
  "refunded",
])

export const PAYMENT_DIRECTIONS = new Set<PaymentDirection>([
  "inbound",
  "outbound",
])

export const PAYMENT_PURPOSES = new Set<PaymentPurpose>([
  "hosting",
  "domain",
  "web_development",
  "app_development",
  "ssl",
  "pif",
  "training",
  "design",
  "others",
])

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, PaymentMethodLabel> = {
  bank_transfer: "Bank transfer",
  card: "Card",
  cash: "Cash",
  other: "Other",
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, PaymentStatusLabel> = {
  pending: "Pending",
  completed: "Completed",
  failed: "Failed",
  refunded: "Refunded",
}

export const PAYMENT_PURPOSE_LABELS: Record<PaymentPurpose, PaymentPurposeLabel> =
  {
    hosting: "Hosting",
    domain: "Domain",
    web_development: "Web development",
    app_development: "App development",
    ssl: "SSL",
    pif: "PIF",
    training: "Training",
    design: "Design",
    others: "Others",
  }

export function isPaymentMethod(value: string): value is PaymentMethod {
  return PAYMENT_METHODS.has(value as PaymentMethod)
}

export function isPaymentStatus(value: string): value is PaymentStatus {
  return PAYMENT_STATUSES.has(value as PaymentStatus)
}

export function isPaymentDirection(value: string): value is PaymentDirection {
  return PAYMENT_DIRECTIONS.has(value as PaymentDirection)
}

export function isPaymentPurpose(value: string): value is PaymentPurpose {
  return PAYMENT_PURPOSES.has(value as PaymentPurpose)
}

export function formatPaymentDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { dateStyle: "medium" })
}
