import "server-only"

import type {
  FinanceBreakdownRow,
  FinancePerformanceReport,
  FinancePnLFilters,
  FinancePnLReport,
  FinanceReportTab,
} from "@/lib/admin/finance-report-types"
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
  FinanceClientRankRow,
  FinanceMonthlyPoint,
  FinancePerformanceReport,
  FinancePnLFilters,
  FinancePnLReport,
  FinanceReportTab,
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

export function parseFinanceReportTab(
  value: string | undefined
): FinanceReportTab {
  if (value === "performance") return "performance"
  if (value === "reconciliation") return "reconciliation"
  return "pnl"
}

export function parsePerformanceYear(value: string | undefined) {
  const nowYear = new Date().getFullYear()
  const parsed = Number.parseInt(value ?? "", 10)
  if (!Number.isInteger(parsed) || parsed < 2000 || parsed > 2100) {
    return nowYear
  }
  return parsed
}

function monthKey(dateValue: string) {
  return dateValue.slice(0, 7)
}

function buildYearMonths(year: number) {
  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1
    const key = `${year}-${String(month).padStart(2, "0")}`
    const label = new Date(year, index, 1).toLocaleDateString("en-US", {
      month: "short",
    })
    return { key, label, income: 0, expenses: 0, profit: 0 }
  })
}

export async function getFinancePerformanceReport(options: {
  year?: string
} = {}): Promise<FinancePerformanceReport> {
  const year = parsePerformanceYear(options.year)
  const from = `${year}-01-01`
  const to = `${year}-12-31`
  const supabase = createAdminClient()

  const [paymentsResult, expensesResult] = await Promise.all([
    supabase
      .from("crm_payments")
      .select("id, amount, client_id, paid_at")
      .eq("direction", "inbound")
      .eq("status", "completed")
      .gte("paid_at", from)
      .lte("paid_at", to),
    supabase
      .from("crm_expenses")
      .select("id, amount, category, spent_at")
      .in("status", ["paid", "reimbursed"])
      .gte("spent_at", from)
      .lte("spent_at", to),
  ])

  if (paymentsResult.error) {
    console.error("Failed to load performance payments", paymentsResult.error)
    throw paymentsResult.error
  }
  if (expensesResult.error) {
    console.error("Failed to load performance expenses", expensesResult.error)
    throw expensesResult.error
  }

  const payments = paymentsResult.data ?? []
  const expenses = expensesResult.data ?? []

  const monthly = buildYearMonths(year)
  const monthMap = new Map(monthly.map((point) => [point.key, point]))

  for (const row of payments) {
    const key = monthKey(row.paid_at)
    const point = monthMap.get(key)
    if (point) point.income += toAmount(row.amount)
  }

  for (const row of expenses) {
    const key = monthKey(row.spent_at)
    const point = monthMap.get(key)
    if (point) point.expenses += toAmount(row.amount)
  }

  for (const point of monthly) {
    point.income = Math.round(point.income * 100) / 100
    point.expenses = Math.round(point.expenses * 100) / 100
    point.profit = Math.round((point.income - point.expenses) * 100) / 100
  }

  const incomeTotal = monthly.reduce((sum, point) => sum + point.income, 0)
  const expenseTotal = monthly.reduce((sum, point) => sum + point.expenses, 0)
  const profit = incomeTotal - expenseTotal
  const marginPercent = incomeTotal > 0 ? (profit / incomeTotal) * 100 : 0

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

  const clientTotals = new Map<
    string,
    { clientId: string; amount: number; count: number }
  >()

  for (const row of payments) {
    if (!row.client_id) continue
    const existing = clientTotals.get(row.client_id)
    if (existing) {
      existing.amount += toAmount(row.amount)
      existing.count += 1
    } else {
      clientTotals.set(row.client_id, {
        clientId: row.client_id,
        amount: toAmount(row.amount),
        count: 1,
      })
    }
  }

  const ranked = Array.from(clientTotals.values())
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  const clientIds = ranked.map((row) => row.clientId)
  const clientNames = new Map<string, string>()

  if (clientIds.length > 0) {
    const { data: clients, error: clientsError } = await supabase
      .from("crm_clients")
      .select("id, company")
      .in("id", clientIds)

    if (clientsError) {
      console.error("Failed to load performance clients", clientsError)
    } else {
      for (const client of clients ?? []) {
        clientNames.set(client.id, client.company)
      }
    }
  }

  const topClients = ranked.map((row) => ({
    clientId: row.clientId,
    clientName: clientNames.get(row.clientId) ?? "Unknown client",
    amount: Math.round(row.amount * 100) / 100,
    count: row.count,
    share: incomeTotal > 0 ? (row.amount / incomeTotal) * 100 : 0,
  }))

  return {
    year,
    from,
    to,
    incomeTotal: Math.round(incomeTotal * 100) / 100,
    expenseTotal: Math.round(expenseTotal * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    marginPercent,
    monthly,
    expensesByCategory,
    topClients,
  }
}
