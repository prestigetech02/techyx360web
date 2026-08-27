import "server-only"

import {
  formatPayrollPeriod,
  isPayrollRunStatus,
  monthlyGrossFromSalary,
  type PayrollItemView,
  type PayrollRunStatus,
  type PayrollRunView,
} from "@/lib/payroll/payroll-types"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/types/database"

export type PayrollRunRow = Database["public"]["Tables"]["payroll_runs"]["Row"]
export type PayrollItemRow = Database["public"]["Tables"]["payroll_items"]["Row"]

const RUN_SELECT =
  "id, period_year, period_month, label, status, currency, gross_total, bonus_total, deductions_total, net_total, employee_count, paid_at, payment_reference, notes, expense_id, created_by, approved_by, approved_at, created_at, updated_at"

const ITEM_SELECT =
  "id, run_id, team_member_id, employee_name, employee_email, role, department, bank_name, account_name, account_number, gross_amount, bonus_amount, deduction_amount, deduction_note, net_amount, currency, payslip_number, notes, created_at, updated_at"

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

export function mapPayrollItemRow(row: PayrollItemRow): PayrollItemView {
  return {
    id: row.id,
    runId: row.run_id,
    teamMemberId: row.team_member_id,
    employeeName: row.employee_name,
    employeeEmail: row.employee_email,
    role: row.role,
    department: row.department,
    bankName: row.bank_name,
    accountName: row.account_name,
    accountNumber: row.account_number,
    grossAmount: toAmount(row.gross_amount),
    bonusAmount: toAmount(row.bonus_amount),
    deductionAmount: toAmount(row.deduction_amount),
    deductionNote: row.deduction_note,
    netAmount: toAmount(row.net_amount),
    currency: row.currency,
    payslipNumber: row.payslip_number,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapPayrollRunRow(
  row: PayrollRunRow,
  items?: PayrollItemView[]
): PayrollRunView {
  return {
    id: row.id,
    periodYear: row.period_year,
    periodMonth: row.period_month,
    label: row.label,
    status: isPayrollRunStatus(row.status) ? row.status : "draft",
    currency: row.currency,
    grossTotal: toAmount(row.gross_total),
    bonusTotal: toAmount(row.bonus_total),
    deductionsTotal: toAmount(row.deductions_total),
    netTotal: toAmount(row.net_total),
    employeeCount: row.employee_count,
    paidAt: row.paid_at,
    paymentReference: row.payment_reference,
    notes: row.notes,
    expenseId: row.expense_id,
    createdBy: row.created_by,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items,
  }
}

function computeItemNet(
  gross: number,
  bonus: number,
  deduction: number
) {
  return roundMoney(Math.max(0, gross + bonus - deduction))
}

function summarizeItems(items: Array<{
  gross_amount: number
  bonus_amount: number
  deduction_amount: number
  net_amount: number
}>) {
  const grossTotal = roundMoney(
    items.reduce((sum, item) => sum + toAmount(item.gross_amount), 0)
  )
  const bonusTotal = roundMoney(
    items.reduce((sum, item) => sum + toAmount(item.bonus_amount), 0)
  )
  const deductionsTotal = roundMoney(
    items.reduce((sum, item) => sum + toAmount(item.deduction_amount), 0)
  )
  const netTotal = roundMoney(
    items.reduce((sum, item) => sum + toAmount(item.net_amount), 0)
  )

  return {
    grossTotal,
    bonusTotal,
    deductionsTotal,
    netTotal,
    employeeCount: items.length,
  }
}

function payslipNumber(year: number, month: number, index: number) {
  return `PS-${year}-${String(month).padStart(2, "0")}-${String(index).padStart(3, "0")}`
}

async function refreshRunTotals(runId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("payroll_items")
    .select("gross_amount, bonus_amount, deduction_amount, net_amount")
    .eq("run_id", runId)

  if (error) throw error

  const totals = summarizeItems(data ?? [])
  const now = new Date().toISOString()

  const { error: updateError } = await supabase
    .from("payroll_runs")
    .update({
      gross_total: totals.grossTotal,
      bonus_total: totals.bonusTotal,
      deductions_total: totals.deductionsTotal,
      net_total: totals.netTotal,
      employee_count: totals.employeeCount,
      updated_at: now,
    })
    .eq("id", runId)

  if (updateError) throw updateError
  return totals
}

export async function getAllPayrollRuns(): Promise<PayrollRunView[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("payroll_runs")
    .select(RUN_SELECT)
    .order("period_year", { ascending: false })
    .order("period_month", { ascending: false })

  if (error) throw error
  return (data ?? []).map((row) => mapPayrollRunRow(row))
}

export async function getPayrollRunById(
  id: string
): Promise<PayrollRunView | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("payroll_runs")
    .select(RUN_SELECT)
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const { data: items, error: itemsError } = await supabase
    .from("payroll_items")
    .select(ITEM_SELECT)
    .eq("run_id", id)
    .order("employee_name", { ascending: true })

  if (itemsError) throw itemsError

  return mapPayrollRunRow(
    data,
    (items ?? []).map((item) => mapPayrollItemRow(item))
  )
}

export async function getPayrollItemById(id: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("payroll_items")
    .select(ITEM_SELECT)
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const run = await getPayrollRunById(data.run_id)
  return {
    item: mapPayrollItemRow(data),
    run,
  }
}

export async function createPayrollRun(input: {
  year: number
  month: number
  createdBy?: string
  notes?: string
}) {
  const year = input.year
  const month = input.month
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error("Invalid payroll year.")
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Invalid payroll month.")
  }

  const supabase = createAdminClient()
  const label = formatPayrollPeriod(year, month)

  const { data: members, error: membersError } = await supabase
    .from("team_members")
    .select(
      "id, full_name, email, role, department, status, base_salary, salary_currency, payment_frequency, bank_name, account_name, account_number"
    )
    .in("status", ["active", "on_leave"])
    .not("base_salary", "is", null)
    .order("full_name", { ascending: true })

  if (membersError) throw membersError

  const eligible = (members ?? []).filter((member) => {
    const salary = toAmount(member.base_salary)
    return salary > 0
  })

  if (eligible.length === 0) {
    throw new Error(
      "No eligible team members found. Add active staff with a base salary first."
    )
  }

  const now = new Date().toISOString()
  const itemRows = eligible.map((member, index) => {
    const gross = monthlyGrossFromSalary(
      toAmount(member.base_salary),
      member.payment_frequency
    )
    const bonus = 0
    const deduction = 0
    return {
      team_member_id: member.id,
      employee_name: member.full_name,
      employee_email: member.email,
      role: member.role,
      department: member.department,
      bank_name: member.bank_name ?? "",
      account_name: member.account_name ?? "",
      account_number: member.account_number ?? "",
      gross_amount: gross,
      bonus_amount: bonus,
      deduction_amount: deduction,
      deduction_note: "",
      net_amount: computeItemNet(gross, bonus, deduction),
      currency: member.salary_currency || "NGN",
      payslip_number: payslipNumber(year, month, index + 1),
      notes: "",
    }
  })

  const totals = summarizeItems(itemRows)

  const { data: run, error: runError } = await supabase
    .from("payroll_runs")
    .insert({
      period_year: year,
      period_month: month,
      label,
      status: "draft",
      currency: "NGN",
      gross_total: totals.grossTotal,
      bonus_total: totals.bonusTotal,
      deductions_total: totals.deductionsTotal,
      net_total: totals.netTotal,
      employee_count: totals.employeeCount,
      notes: input.notes?.trim() || "",
      created_by: input.createdBy?.trim() || "Admin",
      updated_at: now,
    })
    .select(RUN_SELECT)
    .single()

  if (runError || !run) {
    if (runError?.code === "23505") {
      throw new Error(`A payroll run for ${label} already exists.`)
    }
    throw runError ?? new Error("Unable to create payroll run.")
  }

  const { error: itemsError } = await supabase.from("payroll_items").insert(
    itemRows.map((item) => ({
      ...item,
      run_id: run.id,
      updated_at: now,
    }))
  )

  if (itemsError) {
    await supabase.from("payroll_runs").delete().eq("id", run.id)
    throw itemsError
  }

  return getPayrollRunById(run.id)
}

export async function updatePayrollItem(
  id: string,
  input: {
    grossAmount?: number
    bonusAmount?: number
    deductionAmount?: number
    deductionNote?: string
    notes?: string
  }
) {
  const supabase = createAdminClient()
  const existing = await getPayrollItemById(id)
  if (!existing?.item || !existing.run) {
    throw new Error("Payroll item not found.")
  }
  if (existing.run.status !== "draft") {
    throw new Error("Only draft payroll items can be edited.")
  }

  const gross =
    input.grossAmount !== undefined
      ? roundMoney(input.grossAmount)
      : existing.item.grossAmount
  const bonus =
    input.bonusAmount !== undefined
      ? roundMoney(input.bonusAmount)
      : existing.item.bonusAmount
  const deduction =
    input.deductionAmount !== undefined
      ? roundMoney(input.deductionAmount)
      : existing.item.deductionAmount

  if (gross < 0 || bonus < 0 || deduction < 0) {
    throw new Error("Amounts cannot be negative.")
  }

  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from("payroll_items")
    .update({
      gross_amount: gross,
      bonus_amount: bonus,
      deduction_amount: deduction,
      deduction_note:
        input.deductionNote !== undefined
          ? input.deductionNote.trim()
          : existing.item.deductionNote,
      notes:
        input.notes !== undefined ? input.notes.trim() : existing.item.notes,
      net_amount: computeItemNet(gross, bonus, deduction),
      updated_at: now,
    })
    .eq("id", id)
    .select(ITEM_SELECT)
    .single()

  if (error || !data) throw error ?? new Error("Unable to update payroll item.")

  await refreshRunTotals(existing.item.runId)
  return mapPayrollItemRow(data)
}

export async function deletePayrollItem(id: string) {
  const existing = await getPayrollItemById(id)
  if (!existing?.item || !existing.run) {
    throw new Error("Payroll item not found.")
  }
  if (existing.run.status !== "draft") {
    throw new Error("Only draft payroll items can be removed.")
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from("payroll_items").delete().eq("id", id)
  if (error) throw error

  await refreshRunTotals(existing.item.runId)
}

export async function setPayrollRunStatus(
  id: string,
  status: PayrollRunStatus,
  options?: { approvedBy?: string }
) {
  const run = await getPayrollRunById(id)
  if (!run) throw new Error("Payroll run not found.")

  if (status === "approved") {
    if (run.status !== "draft") {
      throw new Error("Only draft runs can be approved.")
    }
    if (run.employeeCount === 0) {
      throw new Error("Cannot approve an empty payroll run.")
    }
  }

  if (status === "draft") {
    if (run.status !== "approved") {
      throw new Error("Only approved runs can be reverted to draft.")
    }
  }

  const now = new Date().toISOString()
  const patch: Database["public"]["Tables"]["payroll_runs"]["Update"] = {
    status,
    updated_at: now,
  }

  if (status === "approved") {
    patch.approved_by = options?.approvedBy?.trim() || "Admin"
    patch.approved_at = now
  }
  if (status === "draft") {
    patch.approved_by = null
    patch.approved_at = null
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from("payroll_runs").update(patch).eq("id", id)
  if (error) throw error

  return getPayrollRunById(id)
}

export async function markPayrollRunPaid(
  id: string,
  input: { paidAt: string; paymentReference?: string }
) {
  const run = await getPayrollRunById(id)
  if (!run) throw new Error("Payroll run not found.")
  if (run.status !== "approved") {
    throw new Error("Only approved runs can be marked as paid.")
  }
  if (run.expenseId) {
    throw new Error("This payroll run is already linked to an expense.")
  }

  const paidAt = input.paidAt.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(paidAt)) {
    throw new Error("Paid date must be YYYY-MM-DD.")
  }

  const supabase = createAdminClient()
  const now = new Date().toISOString()
  const reference = input.paymentReference?.trim() || `PAYROLL-${run.label}`

  const { data: expense, error: expenseError } = await supabase
    .from("crm_expenses")
    .insert({
      amount: run.netTotal,
      category: "salary",
      vendor: "Payroll",
      method: "bank_transfer",
      status: "paid",
      spent_at: paidAt,
      reference,
      description: `Payroll ${run.label}`,
      notes: `Auto-created from payroll run ${run.id}`,
      payroll_run_id: run.id,
      updated_at: now,
    })
    .select("id")
    .single()

  if (expenseError || !expense) {
    throw expenseError ?? new Error("Unable to create salary expense.")
  }

  const { error: runError } = await supabase
    .from("payroll_runs")
    .update({
      status: "paid",
      paid_at: paidAt,
      payment_reference: reference,
      expense_id: expense.id,
      updated_at: now,
    })
    .eq("id", id)

  if (runError) {
    await supabase.from("crm_expenses").delete().eq("id", expense.id)
    throw runError
  }

  return getPayrollRunById(id)
}

export async function deletePayrollRun(id: string) {
  const run = await getPayrollRunById(id)
  if (!run) throw new Error("Payroll run not found.")
  if (run.status === "paid") {
    throw new Error("Paid payroll runs cannot be deleted.")
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from("payroll_runs").delete().eq("id", id)
  if (error) throw error
}

export function getPayrollListStats(runs: PayrollRunView[]) {
  const now = new Date()
  const thisYear = now.getFullYear()
  const thisMonth = now.getMonth() + 1

  const thisMonthRun =
    runs.find(
      (run) => run.periodYear === thisYear && run.periodMonth === thisMonth
    ) ?? null

  const ytdNet = runs
    .filter((run) => run.periodYear === thisYear && run.status === "paid")
    .reduce((sum, run) => sum + run.netTotal, 0)

  const draftCount = runs.filter((run) => run.status === "draft").length

  return {
    thisMonthStatus: thisMonthRun?.status ?? null,
    thisMonthLabel: thisMonthRun?.label ?? formatPayrollPeriod(thisYear, thisMonth),
    ytdNetPaid: ytdNet,
    lastRunEmployees: thisMonthRun?.employeeCount ?? 0,
    draftCount,
  }
}
