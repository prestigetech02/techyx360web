"use client"

import { useEffect, useState, useTransition, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  FileWarning,
  Scale,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  RECONCILIATION_STATUS_LABELS,
  type FinanceReconciliationView,
  type ReconciliationStatus,
} from "@/lib/admin/finance-reconciliation-types"
import { formatNaira } from "@/lib/invoices/formatting"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

type Props = {
  reconciliation: FinanceReconciliationView
  pathname?: string
}

const labelClassName = "mb-1.5 block text-xs font-medium text-foreground"
const fieldClassName =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

function statusClass(status: ReconciliationStatus) {
  switch (status) {
    case "open":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400"
    case "reviewed":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-400"
    case "closed":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
  }
}

async function readError(response: Response, fallback: string) {
  const data = (await response.json().catch(() => null)) as {
    error?: string
  } | null
  return data?.error ?? fallback
}

export function FinanceReconciliationPanel({
  reconciliation,
  pathname = "/admin/reports",
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [year, setYear] = useState(String(reconciliation.periodYear))
  const [month, setMonth] = useState(String(reconciliation.periodMonth))
  const [openingBalance, setOpeningBalance] = useState(
    String(reconciliation.openingBalance)
  )
  const [closingBalance, setClosingBalance] = useState(
    String(reconciliation.closingBalance)
  )
  const [notes, setNotes] = useState(reconciliation.notes)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setYear(String(reconciliation.periodYear))
    setMonth(String(reconciliation.periodMonth))
    setOpeningBalance(String(reconciliation.openingBalance))
    setClosingBalance(String(reconciliation.closingBalance))
    setNotes(reconciliation.notes)
  }, [reconciliation])

  const expectedClosing =
    Number(openingBalance || 0) +
    reconciliation.incomeTotal -
    reconciliation.expenseTotal
  const difference = Number(closingBalance || 0) - expectedClosing
  const isBalanced = Math.abs(difference) < 0.005
  const locked = reconciliation.status === "closed"

  function changePeriod() {
    const params = new URLSearchParams()
    params.set("tab", "reconciliation")
    params.set("year", year)
    params.set("month", month)
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  async function save(status: ReconciliationStatus) {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/reconciliations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: Number(year),
          month: Number(month),
          openingBalance: Number(openingBalance),
          closingBalance: Number(closingBalance),
          notes,
          status,
        }),
      })

      if (!response.ok) {
        notify.error(await readError(response, "Unable to save reconciliation."))
        return
      }

      notify.success(
        status === "closed"
          ? "Reconciliation closed."
          : status === "reviewed"
            ? "Marked as reviewed."
            : "Reconciliation saved."
      )
      startTransition(() => router.refresh())
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await save(reconciliation.status === "closed" ? "open" : reconciliation.status)
  }

  const checklist = [
    {
      label: "Unlinked completed payments",
      value: reconciliation.checklist.unlinkedPayments,
      hint: "Inbound payments with no invoice",
      href: "/admin/payments",
    },
    {
      label: "Pending expenses",
      value: reconciliation.checklist.pendingExpenses,
      hint: "Expenses not marked paid yet",
      href: "/admin/expenses",
    },
    {
      label: "Unpaid payroll runs",
      value: reconciliation.checklist.unpaidPayrollRuns,
      hint: "Draft or approved pay runs this month",
      href: "/admin/payroll",
    },
  ]

  return (
    <div className="min-w-0 space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Reconciliation
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Compare your bank opening/closing balance to income and expenses for{" "}
            {reconciliation.label}.
          </p>
        </div>
        <Badge
          className={cn("border-0 capitalize", statusClass(reconciliation.status))}
        >
          {RECONCILIATION_STATUS_LABELS[reconciliation.status]}
        </Badge>
      </div>

      <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="recon-year" className={labelClassName}>
              Year
            </label>
            <input
              id="recon-year"
              type="number"
              min={2000}
              max={2100}
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className={fieldClassName}
            />
          </div>
          <div>
            <label htmlFor="recon-month" className={labelClassName}>
              Month
            </label>
            <select
              id="recon-month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className={cn(fieldClassName, "appearance-none")}
            >
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index + 1} value={String(index + 1)}>
                  {new Date(2000, index, 1).toLocaleString("en-US", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full rounded-xl"
              disabled={isPending}
              onClick={changePeriod}
            >
              Load period
            </Button>
          </div>
        </div>
      </section>

      <div className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Income (system)</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-foreground">
            {formatNaira(reconciliation.incomeTotal)}
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Expenses (system)</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-foreground">
            {formatNaira(reconciliation.expenseTotal)}
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Expected closing</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-foreground">
            {formatNaira(expectedClosing)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Opening + income − expenses
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Difference</p>
          <p
            className={cn(
              "mt-1 text-xl font-bold tabular-nums",
              isBalanced
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-red-700 dark:text-red-400"
            )}
          >
            {formatNaira(difference)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Closing − expected
          </p>
        </div>
      </div>

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="space-y-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5"
      >
        <div className="flex items-center gap-2">
          <Scale className="size-4 text-muted-foreground" aria-hidden />
          <h3 className="text-sm font-semibold text-foreground">
            Bank balances
          </h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="opening-balance" className={labelClassName}>
              Opening balance
            </label>
            <Input
              id="opening-balance"
              type="number"
              step="0.01"
              required
              disabled={locked || saving}
              value={openingBalance}
              onChange={(event) => setOpeningBalance(event.target.value)}
              className="h-10 rounded-xl"
            />
          </div>
          <div>
            <label htmlFor="closing-balance" className={labelClassName}>
              Closing balance
            </label>
            <Input
              id="closing-balance"
              type="number"
              step="0.01"
              required
              disabled={locked || saving}
              value={closingBalance}
              onChange={(event) => setClosingBalance(event.target.value)}
              className="h-10 rounded-xl"
            />
          </div>
        </div>

        <div>
          <label htmlFor="recon-notes" className={labelClassName}>
            Notes
          </label>
          <textarea
            id="recon-notes"
            rows={3}
            disabled={locked || saving}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Explain fees, transfers, or timing differences…"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {!locked ? (
            <>
              <Button
                type="submit"
                className="h-10 rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
                disabled={saving || isPending}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl"
                disabled={saving || isPending}
                onClick={() => void save("reviewed")}
              >
                Mark reviewed
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-2 rounded-xl"
                disabled={saving || isPending || !isBalanced}
                onClick={() => void save("closed")}
              >
                <CheckCircle2 className="size-4" aria-hidden />
                Close period
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl"
              disabled={saving || isPending}
              onClick={() => void save("open")}
            >
              Reopen period
            </Button>
          )}
        </div>

        {!isBalanced ? (
          <p className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            Difference is not zero. Review missing payments/expenses or bank fees
            before closing.
          </p>
        ) : (
          <p className="flex items-start gap-2 text-sm text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
            Balances match for this period.
          </p>
        )}
      </form>

      <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-2">
            <FileWarning className="size-4 text-muted-foreground" aria-hidden />
            <h3 className="text-base font-semibold text-foreground">
              Checklist
            </h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Items that often explain reconciliation gaps.
          </p>
        </div>
        <div className="divide-y divide-border/60">
          {checklist.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.hint}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
                    item.value > 0
                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  )}
                >
                  {item.value}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  render={<Link href={item.href} />}
                >
                  Review
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <CircleDollarSign className="size-3.5" aria-hidden />
        Income = completed inbound payments. Expenses = paid/reimbursed expenses
        (including payroll salary posts).
      </p>
    </div>
  )
}
