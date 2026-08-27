import "server-only"

import type { FinancePnLFilters, FinancePnLReport } from "@/lib/admin/finance-report-types"
import {
  EXPENSE_CATEGORY_LABELS,
  isExpenseCategory,
  type ExpenseCategory,
} from "@/lib/crm/expense-types"
import {
  PAYMENT_PURPOSE_LABELS,
  isPaymentPurpose,
  type PaymentPurpose,
} from "@/lib/crm/payment-types"
import { createAdminClient } from "@/lib/supabase/admin"

export type {
  FinanceBreakdownRow,
  FinancePnLFilters,
  FinancePnLReport,
} from "@/lib/admin/finance-report-types"

function toDateOnly(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function getDefaultPnLRange() {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    from: toDateOnly(from),
    to: toDateOnly(to),
  }
}

function isValidDateOnly(value: string | undefined) {
  if (!value) return false
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00`)
  return !Number.isNaN(date.getTime())
}

export function parseFinancePnLFilters(options: {
  from?: string
  to?: string
  purpose?: string
  category?: string
  clientId?: string
}): FinancePnLFilters {
  const defaults = getDefaultPnLRange()
  let from = isValidDateOnly(options.from) ? options.from! : defaults.from
  let to = isValidDateOnly(options.to) ? options.to! : defaults.to

  if (from > to) {
    const swap = from
    from = to
    to = swap
  }

  const purpose =
    options.purpose && isPaymentPurpose(options.purpose)
      ? options.purpose
      : undefined
  const category =
    options.category && isExpenseCategory(options.category)
      ? options.category
      : undefined
  const clientId = options.clientId?.trim() || undefined

  return { from, to, purpose, category, clientId }
}

function toAmount(value: number | string | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function buildBreakdown(
  rows: Array<{ key: string; label: string; amount: number }>,
  total: number
): FinanceBreakdownRow[] {
  const map = new Map<
    string,
    { key: string; label: string; amount: number; count: number }
  >()

  for (const row of rows) {
    const existing = map.get(row.key)
    if (existing) {
      existing.amount += row.amount
      existing.count += 1
    } else {
      map.set(row.key, {
        key: row.key,
        label: row.label,
        amount: row.amount,
        count: 1,
      })
    }
  }

  return Array.from(map.values())
    .map((item) => ({
      ...item,
      share: total > 0 ? (item.amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
}

export async function getFinancePnLReport(
  options: {
    from?: string
    to?: string
    purpose?: string
    category?: string
    clientId?: string
  } = {}
): Promise<FinancePnLReport> {
  const filters = parseFinancePnLFilters(options)
  const supabase = createAdminClient()

  let paymentsQuery = supabase
    .from("crm_payments")
    .select("id, amount, purpose, client_id, paid_at")
    .eq("direction", "inbound")
    .eq("status", "completed")
    .gte("paid_at", filters.from)
    .lte("paid_at", filters.to)

  if (filters.purpose) {
    paymentsQuery = paymentsQuery.eq("purpose", filters.purpose)
  }
  if (filters.clientId) {
    paymentsQuery = paymentsQuery.eq("client_id", filters.clientId)
  }

  let expensesQuery = supabase
    .from("crm_expenses")
    .select("id, amount, category, client_id, spent_at")
    .in("status", ["paid", "reimbursed"])
    .gte("spent_at", filters.from)
    .lte("spent_at", filters.to)

  if (filters.category) {
    expensesQuery = expensesQuery.eq("category", filters.category)
  }
  if (filters.clientId) {
    expensesQuery = expensesQuery.eq("client_id", filters.clientId)
  }

  const [paymentsResult, expensesResult] = await Promise.all([
    paymentsQuery,
    expensesQuery,
  ])

  if (paymentsResult.error) {
    console.error("Failed to load P&L payments", paymentsResult.error)
    throw paymentsResult.error
  }
  if (expensesResult.error) {
    console.error("Failed to load P&L expenses", expensesResult.error)
    throw expensesResult.error
  }

  const payments = paymentsResult.data ?? []
  const expenses = expensesResult.data ?? []

  const incomeTotal = payments.reduce(
    (sum, row) => sum + toAmount(row.amount),
    0
  )
  const expenseTotal = expenses.reduce(
    (sum, row) => sum + toAmount(row.amount),
    0
  )
  const profit = incomeTotal - expenseTotal
  const marginPercent = incomeTotal > 0 ? (profit / incomeTotal) * 100 : 0

  const incomeByPurpose = buildBreakdown(
    payments.map((row) => {
      const purpose = isPaymentPurpose(row.purpose)
        ? row.purpose
        : ("others" as PaymentPurpose)
      return {
        key: purpose,
        label: PAYMENT_PURPOSE_LABELS[purpose],
        amount: toAmount(row.amount),
      }
    }),
    incomeTotal
  )

  const expensesByCategory = buildBreakdown(
    expenses.map((row) => {
      const category = isExpenseCategory(row.category)
        ? row.category
        : ("others" as ExpenseCategory)
      return {
        key: category,
        label: EXPENSE_CATEGORY_LABELS[category],
        amount: toAmount(row.amount),
      }
    }),
    expenseTotal
  )

  return {
    filters: {
      from: filters.from,
      to: filters.to,
      purpose: filters.purpose ?? "",
      category: filters.category ?? "",
      clientId: filters.clientId ?? "",
    },
    incomeTotal,
    expenseTotal,
    profit,
    marginPercent,
    incomeCount: payments.length,
    expenseCount: expenses.length,
    incomeByPurpose,
    expensesByCategory,
  }
}
