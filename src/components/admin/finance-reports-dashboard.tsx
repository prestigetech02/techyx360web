"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChevronRight,
  CircleDollarSign,
  Filter,
  Percent,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  EXPENSE_CATEGORY_LABELS,
  type ExpenseCategory,
} from "@/lib/crm/expense-types"
import {
  PAYMENT_PURPOSE_LABELS,
  type PaymentPurpose,
} from "@/lib/crm/payment-types"
import type {
  FinancePerformanceReport,
  FinancePnLReport,
  FinanceReportTab,
} from "@/lib/admin/finance-report-types"
import type { FinanceReconciliationView } from "@/lib/admin/finance-reconciliation-types"
import { FinanceReconciliationPanel } from "@/components/admin/finance-reconciliation-panel"
import { formatNaira } from "@/lib/invoices/formatting"
import { cn } from "@/lib/utils"

export type FinanceReportClientOption = {
  id: string
  company: string
}

type FinanceReportsDashboardProps = {
  tab: FinanceReportTab
  report: FinancePnLReport
  performance: FinancePerformanceReport
  reconciliation: FinanceReconciliationView
  clients: FinanceReportClientOption[]
  pathname?: string
}

const PURPOSE_OPTIONS = Object.entries(PAYMENT_PURPOSE_LABELS) as Array<
  [PaymentPurpose, string]
>
const CATEGORY_OPTIONS = Object.entries(EXPENSE_CATEGORY_LABELS) as Array<
  [ExpenseCategory, string]
>

const PIE_COLORS = [
  "#0d9488",
  "#2563eb",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#64748b",
  "#ec4899",
  "#14b8a6",
]

const fieldClassName =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
const labelClassName = "mb-1.5 block text-xs font-medium text-foreground"
const selectClassName = cn(fieldClassName, "appearance-none")

function formatPeriodLabel(from: string, to: string) {
  const start = new Date(`${from}T00:00:00`)
  const end = new Date(`${to}T00:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${from} → ${to}`
  }
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  }
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`
}

function toMonthRange(offset = 0) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0)
  const toDateOnly = (value: Date) => {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, "0")
    const day = String(value.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }
  return { from: toDateOnly(start), to: toDateOnly(end) }
}

function toYearToDateRange() {
  const now = new Date()
  const from = `${now.getFullYear()}-01-01`
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return { from, to: `${now.getFullYear()}-${month}-${day}` }
}

function compactNaira(value: number) {
  return new Intl.NumberFormat("en-NG", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  iconClass,
  valueClass,
}: {
  label: string
  value: string
  hint: string
  icon: React.ComponentType<{ className?: string }>
  iconClass: string
  valueClass?: string
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground sm:text-sm">
            {label}
          </p>
          <p
            className={cn(
              "mt-1 truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl",
              valueClass
            )}
          >
            {value}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            iconClass
          )}
        >
          <Icon className="size-5" aria-hidden />
        </div>
      </div>
    </div>
  )
}

function BreakdownTable({
  title,
  emptyLabel,
  rows,
}: {
  title: string
  emptyLabel: string
  rows: FinancePnLReport["incomeByPurpose"]
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="border-b border-border/60 px-5 py-4">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>
      {rows.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                <th className="px-5 py-3">Category</th>
                <th className="px-4 py-3 text-right">Count</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-5 py-3 text-right">Share</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.key}
                  className="border-b border-border/40 last:border-0"
                >
                  <td className="px-5 py-3 font-medium text-foreground">
                    {row.label}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {row.count}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground">
                    {formatNaira(row.amount)}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                    {row.share.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function buildHref(
  pathname: string,
  tab: FinanceReportTab,
  extras: Record<string, string | undefined>
) {
  const params = new URLSearchParams()
  if (tab === "performance") params.set("tab", "performance")
  if (tab === "reconciliation") params.set("tab", "reconciliation")

  for (const [key, value] of Object.entries(extras)) {
    if (value) params.set(key, value)
  }

  const search = params.toString()
  return search ? `${pathname}?${search}` : pathname
}

export function FinanceReportsDashboard({
  tab,
  report,
  performance,
  reconciliation,
  clients,
  pathname = "/admin/reports",
}: FinanceReportsDashboardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [from, setFrom] = useState(report.filters.from)
  const [to, setTo] = useState(report.filters.to)
  const [purpose, setPurpose] = useState(report.filters.purpose)
  const [category, setCategory] = useState(report.filters.category)
  const [clientId, setClientId] = useState(report.filters.clientId)
  const [year, setYear] = useState(String(performance.year))

  useEffect(() => {
    setFrom(report.filters.from)
    setTo(report.filters.to)
    setPurpose(report.filters.purpose)
    setCategory(report.filters.category)
    setClientId(report.filters.clientId)
  }, [report.filters])

  useEffect(() => {
    setYear(String(performance.year))
  }, [performance.year])

  const chartData = useMemo(
    () => [
      { name: "Income", amount: report.incomeTotal },
      { name: "Expenses", amount: report.expenseTotal },
      { name: "Profit", amount: report.profit },
    ],
    [report.expenseTotal, report.incomeTotal, report.profit]
  )

  const expensePieData = useMemo(
    () =>
      performance.expensesByCategory.map((row) => ({
        key: row.key,
        name: row.label,
        value: row.amount,
      })),
    [performance.expensesByCategory]
  )

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear()
    return [current, current - 1, current - 2, current - 3]
  }, [])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (report.filters.purpose) count += 1
    if (report.filters.category) count += 1
    if (report.filters.clientId) count += 1
    return count
  }, [report.filters.category, report.filters.clientId, report.filters.purpose])

  function pushPnLFilters(next: {
    from?: string
    to?: string
    purpose?: string
    category?: string
    clientId?: string
  }) {
    startTransition(() => {
      router.push(
        buildHref(pathname, "pnl", {
          from: next.from ?? from,
          to: next.to ?? to,
          purpose: next.purpose ?? purpose,
          category: next.category ?? category,
          client: next.clientId ?? clientId,
        })
      )
    })
  }

  function applyFilters() {
    pushPnLFilters({ from, to, purpose, category, clientId })
  }

  function clearFilters() {
    const range = toMonthRange(0)
    setFrom(range.from)
    setTo(range.to)
    setPurpose("")
    setCategory("")
    setClientId("")
    pushPnLFilters({
      from: range.from,
      to: range.to,
      purpose: "",
      category: "",
      clientId: "",
    })
  }

  function applyPreset(preset: "this-month" | "last-month" | "ytd") {
    const range =
      preset === "this-month"
        ? toMonthRange(0)
        : preset === "last-month"
          ? toMonthRange(-1)
          : toYearToDateRange()
    setFrom(range.from)
    setTo(range.to)
    pushPnLFilters({ from: range.from, to: range.to })
  }

  function applyPerformanceYear() {
    startTransition(() => {
      router.push(
        buildHref(pathname, "performance", {
          year,
        })
      )
    })
  }

  return (
    <div className="min-w-0 space-y-5">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <span>Finance</span>
          <ChevronRight className="size-3.5" aria-hidden />
          <span>Reports</span>
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Reports
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Profit &amp; loss, yearly performance, and light bank reconciliation.
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-border/60">
        <Link
          href={buildHref(pathname, "pnl", {
            from: report.filters.from,
            to: report.filters.to,
            purpose: report.filters.purpose,
            category: report.filters.category,
            client: report.filters.clientId,
          })}
          className={cn(
            "shrink-0 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors",
            tab === "pnl"
              ? "border-brand text-brand"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Profit &amp; Loss
        </Link>
        <Link
          href={buildHref(pathname, "performance", {
            year: String(performance.year),
          })}
          className={cn(
            "shrink-0 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors",
            tab === "performance"
              ? "border-brand text-brand"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Performance
        </Link>
        <Link
          href={buildHref(pathname, "reconciliation", {
            year: String(reconciliation.periodYear),
            month: String(reconciliation.periodMonth),
          })}
          className={cn(
            "shrink-0 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors",
            tab === "reconciliation"
              ? "border-brand text-brand"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Reconciliation
        </Link>
      </div>

      {tab === "reconciliation" ? (
        <FinanceReconciliationPanel
          reconciliation={reconciliation}
          pathname={pathname}
        />
      ) : tab === "pnl" ? (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Profit &amp; Loss
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Income from completed inbound payments minus paid expenses for{" "}
                {formatPeriodLabel(report.filters.from, report.filters.to)}.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl"
                disabled={isPending}
                onClick={() => applyPreset("this-month")}
              >
                This month
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl"
                disabled={isPending}
                onClick={() => applyPreset("last-month")}
              >
                Last month
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl"
                disabled={isPending}
                onClick={() => applyPreset("ytd")}
              >
                Year to date
              </Button>
            </div>
          </div>

          <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" aria-hidden />
              <h2 className="text-sm font-semibold text-foreground">Filters</h2>
              {activeFilterCount > 0 ? (
                <Badge className="border-0 bg-brand/10 text-brand">
                  {activeFilterCount} active
                </Badge>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label htmlFor="pnl-from" className={labelClassName}>
                  From
                </label>
                <Input
                  id="pnl-from"
                  type="date"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>
              <div>
                <label htmlFor="pnl-to" className={labelClassName}>
                  To
                </label>
                <Input
                  id="pnl-to"
                  type="date"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>
              <div>
                <label htmlFor="pnl-purpose" className={labelClassName}>
                  Income purpose
                </label>
                <select
                  id="pnl-purpose"
                  value={purpose}
                  onChange={(event) => setPurpose(event.target.value)}
                  className={selectClassName}
                >
                  <option value="">All purposes</option>
                  {PURPOSE_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="pnl-category" className={labelClassName}>
                  Expense category
                </label>
                <select
                  id="pnl-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className={selectClassName}
                >
                  <option value="">All categories</option>
                  {CATEGORY_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="pnl-client" className={labelClassName}>
                  Client
                </label>
                <select
                  id="pnl-client"
                  value={clientId}
                  onChange={(event) => setClientId(event.target.value)}
                  className={selectClassName}
                >
                  <option value="">All clients</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.company}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                className="h-10 rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
                disabled={isPending}
                onClick={applyFilters}
              >
                Apply filters
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl"
                disabled={isPending}
                onClick={clearFilters}
              >
                Reset
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-10 rounded-xl"
                render={<Link href="/admin/payments" />}
              >
                View payments
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-10 rounded-xl"
                render={<Link href="/admin/expenses" />}
              >
                View expenses
              </Button>
            </div>
          </section>

          <div className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Income"
              value={formatNaira(report.incomeTotal)}
              hint={`${report.incomeCount} payment${report.incomeCount === 1 ? "" : "s"}`}
              icon={CircleDollarSign}
              iconClass="bg-emerald-500/10 text-emerald-600"
            />
            <StatCard
              label="Expenses"
              value={formatNaira(report.expenseTotal)}
              hint={`${report.expenseCount} expense${report.expenseCount === 1 ? "" : "s"}`}
              icon={ReceiptText}
              iconClass="bg-orange-500/10 text-orange-600"
            />
            <StatCard
              label="Profit"
              value={formatNaira(report.profit)}
              hint={report.profit >= 0 ? "Net positive" : "Net loss"}
              icon={report.profit >= 0 ? TrendingUp : TrendingDown}
              iconClass={
                report.profit >= 0
                  ? "bg-sky-500/10 text-sky-600"
                  : "bg-red-500/10 text-red-600"
              }
              valueClass={
                report.profit >= 0
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-red-700 dark:text-red-400"
              }
            />
            <StatCard
              label="Margin"
              value={`${report.marginPercent.toFixed(1)}%`}
              hint="Profit ÷ income"
              icon={Percent}
              iconClass="bg-violet-500/10 text-violet-600"
            />
          </div>

          <section className="overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <Wallet className="size-4 text-muted-foreground" aria-hidden />
              <h2 className="text-base font-semibold text-foreground">
                Period snapshot
              </h2>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border/60"
                  />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={72}
                    tickFormatter={(value: number) => compactNaira(value)}
                  />
                  <Tooltip
                    formatter={(value) => formatNaira(Number(value ?? 0))}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    fill="hsl(var(--brand))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <BreakdownTable
              title="Income by purpose"
              emptyLabel="No completed inbound payments in this period."
              rows={report.incomeByPurpose}
            />
            <BreakdownTable
              title="Expenses by category"
              emptyLabel="No paid expenses in this period."
              rows={report.expensesByCategory}
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Performance
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Monthly revenue, expenses, and profit for {performance.year}.
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label htmlFor="perf-year" className={labelClassName}>
                  Year
                </label>
                <select
                  id="perf-year"
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  className={cn(selectClassName, "min-w-[8rem]")}
                >
                  {yearOptions.map((option) => (
                    <option key={option} value={String(option)}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="button"
                className="h-10 rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
                disabled={isPending}
                onClick={applyPerformanceYear}
              >
                Apply
              </Button>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Income"
              value={formatNaira(performance.incomeTotal)}
              hint={`${performance.year} total`}
              icon={CircleDollarSign}
              iconClass="bg-emerald-500/10 text-emerald-600"
            />
            <StatCard
              label="Expenses"
              value={formatNaira(performance.expenseTotal)}
              hint={`${performance.year} total`}
              icon={ReceiptText}
              iconClass="bg-orange-500/10 text-orange-600"
            />
            <StatCard
              label="Profit"
              value={formatNaira(performance.profit)}
              hint={performance.profit >= 0 ? "Net positive" : "Net loss"}
              icon={performance.profit >= 0 ? TrendingUp : TrendingDown}
              iconClass={
                performance.profit >= 0
                  ? "bg-sky-500/10 text-sky-600"
                  : "bg-red-500/10 text-red-600"
              }
              valueClass={
                performance.profit >= 0
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-red-700 dark:text-red-400"
              }
            />
            <StatCard
              label="Margin"
              value={`${performance.marginPercent.toFixed(1)}%`}
              hint="Profit ÷ income"
              icon={Percent}
              iconClass="bg-violet-500/10 text-violet-600"
            />
          </div>

          <section className="overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-foreground">
                Monthly trend
              </h2>
              <p className="text-sm text-muted-foreground">
                Income vs expenses vs profit by month
              </p>
            </div>
            <div className="h-72 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={performance.monthly}
                  margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-border/60"
                  />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={72}
                    tickFormatter={(value: number) => compactNaira(value)}
                  />
                  <Tooltip
                    formatter={(value) => formatNaira(Number(value ?? 0))}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="#059669"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="expenses"
                    name="Expenses"
                    fill="#ea580c"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="profit"
                    name="Profit"
                    fill="#2563eb"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-5">
            <section className="overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5 lg:col-span-2">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-foreground">
                  Expense mix
                </h2>
                <p className="text-sm text-muted-foreground">
                  Share by category for {performance.year}
                </p>
              </div>
              {expensePieData.length === 0 ? (
                <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
                  No expenses in this year.
                </div>
              ) : (
                <div className="h-56 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensePieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={48}
                        outerRadius={78}
                        paddingAngle={2}
                        strokeWidth={0}
                      >
                        {expensePieData.map((entry, index) => (
                          <Cell
                            key={entry.key}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatNaira(Number(value ?? 0))}
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid hsl(var(--border))",
                          background: "hsl(var(--card))",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm lg:col-span-3">
              <div className="border-b border-border/60 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-muted-foreground" aria-hidden />
                  <h2 className="text-base font-semibold text-foreground">
                    Top clients
                  </h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Highest inbound payment totals in {performance.year}
                </p>
              </div>
              {performance.topClients.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No client-linked payments in this year.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[420px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-border/60 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                        <th className="px-5 py-3">Client</th>
                        <th className="px-4 py-3 text-right">Payments</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-5 py-3 text-right">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performance.topClients.map((client) => (
                        <tr
                          key={client.clientId}
                          className="border-b border-border/40 last:border-0"
                        >
                          <td className="px-5 py-3 font-medium text-foreground">
                            <Link
                              href={`/admin/clients?client=${client.clientId}`}
                              className="hover:text-brand hover:underline"
                            >
                              {client.clientName}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                            {client.count}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-foreground">
                            {formatNaira(client.amount)}
                          </td>
                          <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                            {client.share.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          <BreakdownTable
            title="Expenses by category"
            emptyLabel="No paid expenses in this year."
            rows={performance.expensesByCategory}
          />
        </>
      )}
    </div>
  )
}
