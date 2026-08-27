export type ReconciliationStatus = "open" | "reviewed" | "closed"

export type ReconciliationChecklist = {
  unlinkedPayments: number
  pendingExpenses: number
  unpaidPayrollRuns: number
}

export type FinanceReconciliationView = {
  id: string | null
  periodYear: number
  periodMonth: number
  label: string
  openingBalance: number
  closingBalance: number
  incomeTotal: number
  expenseTotal: number
  expectedClosing: number
  difference: number
  status: ReconciliationStatus
  notes: string
  checklist: ReconciliationChecklist
  createdAt: string | null
  updatedAt: string | null
}

export const RECONCILIATION_STATUSES = new Set<ReconciliationStatus>([
  "open",
  "reviewed",
  "closed",
])

export const RECONCILIATION_STATUS_LABELS: Record<ReconciliationStatus, string> =
  {
    open: "Open",
    reviewed: "Reviewed",
    closed: "Closed",
  }

export function isReconciliationStatus(
  value: string
): value is ReconciliationStatus {
  return RECONCILIATION_STATUSES.has(value as ReconciliationStatus)
}

export function formatReconciliationPeriod(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })
}
