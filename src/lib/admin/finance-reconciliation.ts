import "server-only"

import {
  formatReconciliationPeriod,
  isReconciliationStatus,
  type FinanceReconciliationView,
  type ReconciliationStatus,
} from "@/lib/admin/finance-reconciliation-types"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/types/database"

export type {
  FinanceReconciliationView,
  ReconciliationChecklist,
  ReconciliationStatus,
} from "@/lib/admin/finance-reconciliation-types"

export {
  RECONCILIATION_STATUS_LABELS,
  formatReconciliationPeriod,
  isReconciliationStatus,
} from "@/lib/admin/finance-reconciliation-types"

type ReconciliationRow =
  Database["public"]["Tables"]["finance_reconciliations"]["Row"]

function toAmount(value: number | string | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100
}

function monthBounds(year: number, month: number) {
  const from = `${year}-${String(month).padStart(2, "0")}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`
  return { from, to }
}

export function parseReconciliationPeriod(options: {
  year?: string
  month?: string
}) {
  const now = new Date()
  let year = Number.parseInt(options.year ?? "", 10)
  let month = Number.parseInt(options.month ?? "", 10)

  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    year = now.getFullYear()
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    month = now.getMonth() + 1
  }

  return { year, month }
}

async function getPeriodCashTotals(year: number, month: number) {
  const { from, to } = monthBounds(year, month)
  const supabase = createAdminClient()

  const [paymentsResult, expensesResult] = await Promise.all([
    supabase
      .from("crm_payments")
      .select("amount")
      .eq("direction", "inbound")
      .eq("status", "completed")
      .gte("paid_at", from)
      .lte("paid_at", to),
    supabase
      .from("crm_expenses")
      .select("amount")
      .in("status", ["paid", "reimbursed"])
      .gte("spent_at", from)
      .lte("spent_at", to),
  ])

  if (paymentsResult.error) throw paymentsResult.error
  if (expensesResult.error) throw expensesResult.error

  const incomeTotal = roundMoney(
    (paymentsResult.data ?? []).reduce(
      (sum, row) => sum + toAmount(row.amount),
      0
    )
  )
  const expenseTotal = roundMoney(
    (expensesResult.data ?? []).reduce(
      (sum, row) => sum + toAmount(row.amount),
      0
    )
  )

  return { incomeTotal, expenseTotal }
}

async function getChecklist(year: number, month: number) {
  const { from, to } = monthBounds(year, month)
  const supabase = createAdminClient()

  const [unlinkedResult, pendingExpensesResult, unpaidPayrollResult] =
    await Promise.all([
      supabase
        .from("crm_payments")
        .select("id", { count: "exact", head: true })
        .eq("direction", "inbound")
        .eq("status", "completed")
        .is("invoice_id", null)
        .gte("paid_at", from)
        .lte("paid_at", to),
      supabase
        .from("crm_expenses")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending")
        .gte("spent_at", from)
        .lte("spent_at", to),
      supabase
        .from("payroll_runs")
        .select("id", { count: "exact", head: true })
        .eq("period_year", year)
        .eq("period_month", month)
        .in("status", ["draft", "approved"]),
    ])

  // payroll_runs may not exist yet — treat as 0
  const unpaidPayrollRuns = unpaidPayrollResult.error
    ? 0
    : (unpaidPayrollResult.count ?? 0)

  if (unlinkedResult.error) {
    console.error("Failed to count unlinked payments", unlinkedResult.error)
  }
  if (pendingExpensesResult.error) {
    console.error(
      "Failed to count pending expenses",
      pendingExpensesResult.error
    )
  }

  return {
    unlinkedPayments: unlinkedResult.count ?? 0,
    pendingExpenses: pendingExpensesResult.count ?? 0,
    unpaidPayrollRuns,
  }
}

function mapRow(
  row: ReconciliationRow | null,
  computed: {
    year: number
    month: number
    incomeTotal: number
    expenseTotal: number
    checklist: FinanceReconciliationView["checklist"]
  }
): FinanceReconciliationView {
  const openingBalance = row ? toAmount(row.opening_balance) : 0
  const closingBalance = row ? toAmount(row.closing_balance) : 0
  const incomeTotal = computed.incomeTotal
  const expenseTotal = computed.expenseTotal
  const expectedClosing = roundMoney(openingBalance + incomeTotal - expenseTotal)
  const difference = roundMoney(closingBalance - expectedClosing)

  return {
    id: row?.id ?? null,
    periodYear: computed.year,
    periodMonth: computed.month,
    label: formatReconciliationPeriod(computed.year, computed.month),
    openingBalance,
    closingBalance,
    incomeTotal,
    expenseTotal,
    expectedClosing,
    difference,
    status: row && isReconciliationStatus(row.status) ? row.status : "open",
    notes: row?.notes ?? "",
    checklist: computed.checklist,
    createdAt: row?.created_at ?? null,
    updatedAt: row?.updated_at ?? null,
  }
}

export async function getFinanceReconciliation(options: {
  year?: string
  month?: string
}): Promise<FinanceReconciliationView> {
  const { year, month } = parseReconciliationPeriod(options)
  const supabase = createAdminClient()

  const [{ incomeTotal, expenseTotal }, checklist, existingResult] =
    await Promise.all([
      getPeriodCashTotals(year, month),
      getChecklist(year, month),
      supabase
        .from("finance_reconciliations")
        .select("*")
        .eq("period_year", year)
        .eq("period_month", month)
        .maybeSingle(),
    ])

  if (existingResult.error) {
    // Table might not exist yet
    if (
      existingResult.error.message?.includes("finance_reconciliations") ||
      existingResult.error.code === "42P01"
    ) {
      return mapRow(null, {
        year,
        month,
        incomeTotal,
        expenseTotal,
        checklist,
      })
    }
    throw existingResult.error
  }

  return mapRow(existingResult.data, {
    year,
    month,
    incomeTotal,
    expenseTotal,
    checklist,
  })
}

export async function saveFinanceReconciliation(input: {
  year: number
  month: number
  openingBalance: number
  closingBalance: number
  notes?: string
  status?: ReconciliationStatus
}) {
  const { year, month } = parseReconciliationPeriod({
    year: String(input.year),
    month: String(input.month),
  })

  if (!Number.isFinite(input.openingBalance) || !Number.isFinite(input.closingBalance)) {
    throw new Error("Opening and closing balances must be valid numbers.")
  }

  const openingBalance = roundMoney(input.openingBalance)
  const closingBalance = roundMoney(input.closingBalance)
  const { incomeTotal, expenseTotal } = await getPeriodCashTotals(year, month)
  const expectedClosing = roundMoney(openingBalance + incomeTotal - expenseTotal)
  const difference = roundMoney(closingBalance - expectedClosing)
  const status = input.status ?? "open"
  const now = new Date().toISOString()

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("finance_reconciliations")
    .upsert(
      {
        period_year: year,
        period_month: month,
        opening_balance: openingBalance,
        closing_balance: closingBalance,
        income_total: incomeTotal,
        expense_total: expenseTotal,
        expected_closing: expectedClosing,
        difference,
        status,
        notes: input.notes?.trim() || "",
        updated_at: now,
      },
      { onConflict: "period_year,period_month" }
    )
    .select("*")
    .single()

  if (error || !data) {
    throw error ?? new Error("Unable to save reconciliation.")
  }

  const checklist = await getChecklist(year, month)
  return mapRow(data, {
    year,
    month,
    incomeTotal,
    expenseTotal,
    checklist,
  })
}
