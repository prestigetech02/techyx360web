export type PayrollRunStatus = "draft" | "approved" | "paid"

export type PayrollItemView = {
  id: string
  runId: string
  teamMemberId: string | null
  employeeName: string
  employeeEmail: string
  role: string
  department: string
  bankName: string
  accountName: string
  accountNumber: string
  grossAmount: number
  bonusAmount: number
  deductionAmount: number
  deductionNote: string
  netAmount: number
  currency: string
  payslipNumber: string
  notes: string
  createdAt: string
  updatedAt: string
}

export type PayrollRunView = {
  id: string
  periodYear: number
  periodMonth: number
  label: string
  status: PayrollRunStatus
  currency: string
  grossTotal: number
  bonusTotal: number
  deductionsTotal: number
  netTotal: number
  employeeCount: number
  paidAt: string | null
  paymentReference: string
  notes: string
  expenseId: string | null
  createdBy: string
  approvedBy: string | null
  approvedAt: string | null
  createdAt: string
  updatedAt: string
  items?: PayrollItemView[]
}

export const PAYROLL_RUN_STATUSES = new Set<PayrollRunStatus>([
  "draft",
  "approved",
  "paid",
])

export const PAYROLL_STATUS_LABELS: Record<PayrollRunStatus, string> = {
  draft: "Draft",
  approved: "Approved",
  paid: "Paid",
}

export function isPayrollRunStatus(value: string): value is PayrollRunStatus {
  return PAYROLL_RUN_STATUSES.has(value as PayrollRunStatus)
}

export function formatPayrollPeriod(year: number, month: number) {
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

export function maskAccountNumber(value: string) {
  const digits = value.replace(/\s+/g, "")
  if (digits.length <= 4) return digits || "—"
  return `•••• ${digits.slice(-4)}`
}

export function monthlyGrossFromSalary(
  baseSalary: number,
  frequency: string | null | undefined
) {
  if (!Number.isFinite(baseSalary) || baseSalary < 0) return 0
  switch (frequency) {
    case "Annual":
      return Math.round((baseSalary / 12) * 100) / 100
    case "Bi-weekly":
      return Math.round(((baseSalary * 26) / 12) * 100) / 100
    case "Weekly":
      return Math.round(((baseSalary * 52) / 12) * 100) / 100
    case "Monthly":
    default:
      return Math.round(baseSalary * 100) / 100
  }
}
