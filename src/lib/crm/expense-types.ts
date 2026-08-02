export type ExpenseCategory =
  | "ads"
  | "salary"
  | "tools"
  | "hosting"
  | "domains"
  | "office"
  | "travel"
  | "contractor"
  | "training"
  | "tax"
  | "others"

export type ExpenseMethod = "bank_transfer" | "card" | "cash" | "other"
export type ExpenseStatus = "pending" | "paid" | "reimbursed"

export type ExpenseCategoryLabel =
  | "Ads"
  | "Salary"
  | "Tools / SaaS"
  | "Hosting"
  | "Domains"
  | "Office"
  | "Travel"
  | "Contractor"
  | "Training"
  | "Tax"
  | "Others"

export type ExpenseMethodLabel =
  | "Bank transfer"
  | "Card"
  | "Cash"
  | "Other"

export type ExpenseStatusLabel = "Pending" | "Paid" | "Reimbursed"

export type ExpenseView = {
  id: string
  clientId: string | null
  clientName: string | null
  projectId: string | null
  projectName: string | null
  amount: number
  currency: string
  category: ExpenseCategory
  categoryLabel: ExpenseCategoryLabel
  vendor: string
  method: ExpenseMethod
  methodLabel: ExpenseMethodLabel
  status: ExpenseStatus
  statusLabel: ExpenseStatusLabel
  spentAt: string
  spentAtLabel: string
  reference: string
  description: string
  notes: string
  receiptUrl: string
  createdAt: string
  updatedAt: string
}

export const EXPENSE_CATEGORIES = new Set<ExpenseCategory>([
  "ads",
  "salary",
  "tools",
  "hosting",
  "domains",
  "office",
  "travel",
  "contractor",
  "training",
  "tax",
  "others",
])

export const EXPENSE_METHODS = new Set<ExpenseMethod>([
  "bank_transfer",
  "card",
  "cash",
  "other",
])

export const EXPENSE_STATUSES = new Set<ExpenseStatus>([
  "pending",
  "paid",
  "reimbursed",
])

export const EXPENSE_CATEGORY_LABELS: Record<
  ExpenseCategory,
  ExpenseCategoryLabel
> = {
  ads: "Ads",
  salary: "Salary",
  tools: "Tools / SaaS",
  hosting: "Hosting",
  domains: "Domains",
  office: "Office",
  travel: "Travel",
  contractor: "Contractor",
  training: "Training",
  tax: "Tax",
  others: "Others",
}

export const EXPENSE_METHOD_LABELS: Record<ExpenseMethod, ExpenseMethodLabel> = {
  bank_transfer: "Bank transfer",
  card: "Card",
  cash: "Cash",
  other: "Other",
}

export const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, ExpenseStatusLabel> = {
  pending: "Pending",
  paid: "Paid",
  reimbursed: "Reimbursed",
}

export function isExpenseCategory(value: string): value is ExpenseCategory {
  return EXPENSE_CATEGORIES.has(value as ExpenseCategory)
}

export function isExpenseMethod(value: string): value is ExpenseMethod {
  return EXPENSE_METHODS.has(value as ExpenseMethod)
}

export function isExpenseStatus(value: string): value is ExpenseStatus {
  return EXPENSE_STATUSES.has(value as ExpenseStatus)
}

export function formatExpenseDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { dateStyle: "medium" })
}
