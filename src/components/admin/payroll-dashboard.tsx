"use client"

import { useMemo, useState, useTransition, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChevronRight,
  FileText,
  Plus,
  Users,
  Wallet,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatNaira } from "@/lib/invoices/formatting"
import {
  PAYROLL_STATUS_LABELS,
  type PayrollRunStatus,
  type PayrollRunView,
} from "@/lib/payroll/payroll-types"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

type PayrollDashboardProps = {
  runs: PayrollRunView[]
  stats: {
    thisMonthStatus: PayrollRunStatus | null
    thisMonthLabel: string
    ytdNetPaid: number
    lastRunEmployees: number
    draftCount: number
  }
}

function statusClass(status: PayrollRunStatus) {
  switch (status) {
    case "draft":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400"
    case "approved":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-400"
    case "paid":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
  }
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  iconClass,
}: {
  label: string
  value: string
  hint: string
  icon: React.ComponentType<{ className?: string }>
  iconClass: string
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
          <p className="mt-1 truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
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

async function readError(response: Response, fallback: string) {
  const data = (await response.json().catch(() => null)) as {
    error?: string
  } | null
  return data?.error ?? fallback
}

export function PayrollDashboard({ runs, stats }: PayrollDashboardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const now = useMemo(() => new Date(), [])
  const [year, setYear] = useState(String(now.getFullYear()))
  const [month, setMonth] = useState(String(now.getMonth() + 1))

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    setCreating(true)
    try {
      const response = await fetch("/api/admin/payroll/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: Number(year),
          month: Number(month),
        }),
      })

      if (!response.ok) {
        notify.error(await readError(response, "Unable to create payroll run."))
        return
      }

      const data = (await response.json()) as { run?: PayrollRunView }
      setCreateOpen(false)
      notify.success("Payroll run created.")
      if (data.run?.id) {
        router.push(`/admin/payroll/${data.run.id}`)
        return
      }
      startTransition(() => router.refresh())
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-w-0 space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span>Finance</span>
            <ChevronRight className="size-3.5" aria-hidden />
            <span>Payroll</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Payroll
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create month-end pay runs from Team salaries, approve, mark paid, and
            download payslips.
          </p>
        </div>

        <Button
          type="button"
          className="h-11 shrink-0 gap-2 rounded-xl bg-brand px-5 text-brand-foreground hover:bg-brand/90"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-4" aria-hidden />
          Create pay run
        </Button>
      </div>

      <div className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="This month"
          value={
            stats.thisMonthStatus
              ? PAYROLL_STATUS_LABELS[stats.thisMonthStatus]
              : "Not started"
          }
          hint={stats.thisMonthLabel}
          icon={FileText}
          iconClass="bg-brand/10 text-brand"
        />
        <StatCard
          label="YTD net paid"
          value={formatNaira(stats.ytdNetPaid)}
          hint="Paid runs this year"
          icon={Wallet}
          iconClass="bg-emerald-500/10 text-emerald-600"
        />
        <StatCard
          label="Employees (month)"
          value={String(stats.lastRunEmployees)}
          hint="On this month’s run"
          icon={Users}
          iconClass="bg-sky-500/10 text-sky-600"
        />
        <StatCard
          label="Draft runs"
          value={String(stats.draftCount)}
          hint="Awaiting approval"
          icon={FileText}
          iconClass="bg-amber-500/10 text-amber-600"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">Pay runs</h2>
          <p className="text-sm text-muted-foreground">
            One run per calendar month.
          </p>
        </div>

        {runs.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No payroll runs yet. Create one from Team members with a base salary.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  <th className="px-5 py-3">Period</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Employees</th>
                  <th className="px-4 py-3 text-right">Gross</th>
                  <th className="px-4 py-3 text-right">Net</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr
                    key={run.id}
                    className="border-b border-border/40 last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      {run.label}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        className={cn(
                          "border-0 capitalize",
                          statusClass(run.status)
                        )}
                      >
                        {PAYROLL_STATUS_LABELS[run.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-muted-foreground">
                      {run.employeeCount}
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-foreground">
                      {formatNaira(run.grossTotal)}
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-foreground">
                      {formatNaira(run.netTotal)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        disabled={isPending}
                        render={<Link href={`/admin/payroll/${run.id}`} />}
                      >
                        Open
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create pay run</DialogTitle>
            <DialogDescription>
              Pulls active and on-leave Team members who have a base salary.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => void handleCreate(event)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="payroll-year" className="mb-1.5 block text-xs font-medium">
                  Year
                </label>
                <input
                  id="payroll-year"
                  type="number"
                  min={2000}
                  max={2100}
                  required
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label htmlFor="payroll-month" className="mb-1.5 block text-xs font-medium">
                  Month
                </label>
                <select
                  id="payroll-month"
                  required
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                  className="h-10 w-full appearance-none rounded-xl border border-border bg-background px-3 text-sm"
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
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create run"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
