"use client"

import { useState, useTransition, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  ChevronRight,
  Download,
  Pencil,
  Trash2,
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
import { Input } from "@/components/ui/input"
import { formatNaira } from "@/lib/invoices/formatting"
import {
  PAYROLL_STATUS_LABELS,
  maskAccountNumber,
  type PayrollItemView,
  type PayrollRunStatus,
  type PayrollRunView,
} from "@/lib/payroll/payroll-types"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

type PayrollRunDetailProps = {
  run: PayrollRunView
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

async function readError(response: Response, fallback: string) {
  const data = (await response.json().catch(() => null)) as {
    error?: string
  } | null
  return data?.error ?? fallback
}

function todayIso() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}

export function PayrollRunDetail({ run }: PayrollRunDetailProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const items = run.items ?? []
  const [editItem, setEditItem] = useState<PayrollItemView | null>(null)
  const [gross, setGross] = useState("")
  const [bonus, setBonus] = useState("")
  const [deduction, setDeduction] = useState("")
  const [deductionNote, setDeductionNote] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [payOpen, setPayOpen] = useState(false)
  const [paidAt, setPaidAt] = useState(todayIso())
  const [paymentReference, setPaymentReference] = useState("")
  const [deleteOpen, setDeleteOpen] = useState(false)

  function refresh() {
    startTransition(() => {
      router.refresh()
    })
  }

  function openEdit(item: PayrollItemView) {
    setEditItem(item)
    setGross(String(item.grossAmount))
    setBonus(String(item.bonusAmount))
    setDeduction(String(item.deductionAmount))
    setDeductionNote(item.deductionNote)
    setNotes(item.notes)
  }

  async function saveItem(event: FormEvent) {
    event.preventDefault()
    if (!editItem) return
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/payroll/items/${editItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grossAmount: Number(gross),
          bonusAmount: Number(bonus),
          deductionAmount: Number(deduction),
          deductionNote,
          notes,
        }),
      })
      if (!response.ok) {
        notify.error(await readError(response, "Unable to update line."))
        return
      }
      setEditItem(null)
      notify.success("Payroll line updated.")
      refresh()
    } finally {
      setSaving(false)
    }
  }

  async function patchRun(body: Record<string, unknown>, successMessage: string) {
    const response = await fetch(`/api/admin/payroll/runs/${run.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      notify.error(await readError(response, "Unable to update payroll run."))
      return false
    }
    notify.success(successMessage)
    refresh()
    return true
  }

  async function handleMarkPaid(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      const ok = await patchRun(
        {
          action: "mark_paid",
          paidAt,
          paymentReference,
        },
        "Payroll marked as paid. Salary expense created."
      )
      if (ok) setPayOpen(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    const response = await fetch(`/api/admin/payroll/runs/${run.id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      notify.error(await readError(response, "Unable to delete payroll run."))
      return
    }
    notify.success("Payroll run deleted.")
    router.push("/admin/payroll")
  }

  return (
    <div className="min-w-0 space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Link href="/admin/payroll" className="hover:text-foreground">
              Payroll
            </Link>
            <ChevronRight className="size-3.5" aria-hidden />
            <span>{run.label}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {run.label}
            </h1>
            <Badge className={cn("border-0 capitalize", statusClass(run.status))}>
              {PAYROLL_STATUS_LABELS[run.status]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {run.employeeCount} employee{run.employeeCount === 1 ? "" : "s"} · Net{" "}
            {formatNaira(run.netTotal)}
            {run.paidAt ? ` · Paid ${run.paidAt}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {run.status === "draft" ? (
            <>
              <Button
                type="button"
                className="h-10 gap-2 rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
                disabled={isPending}
                onClick={() =>
                  void patchRun({ action: "approve" }, "Payroll run approved.")
                }
              >
                <CheckCircle2 className="size-4" aria-hidden />
                Approve
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-2 rounded-xl text-destructive"
                disabled={isPending}
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-4" aria-hidden />
                Delete
              </Button>
            </>
          ) : null}

          {run.status === "approved" ? (
            <>
              <Button
                type="button"
                className="h-10 gap-2 rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
                disabled={isPending}
                onClick={() => setPayOpen(true)}
              >
                <Wallet className="size-4" aria-hidden />
                Mark paid
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl"
                disabled={isPending}
                onClick={() =>
                  void patchRun(
                    { action: "revert_draft" },
                    "Payroll run reverted to draft."
                  )
                }
              >
                Revert to draft
              </Button>
            </>
          ) : null}

          {run.expenseId ? (
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl"
              render={<Link href="/admin/expenses" />}
            >
              View expenses
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Gross", value: run.grossTotal },
          { label: "Bonus", value: run.bonusTotal },
          { label: "Deductions", value: run.deductionsTotal },
          { label: "Net", value: run.netTotal },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
          >
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-foreground">
              {formatNaira(card.value)}
            </p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">Employees</h2>
          <p className="text-sm text-muted-foreground">
            Edit amounts while the run is in draft. Download payslips anytime.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No employees on this run.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-4 py-3 text-right">Gross</th>
                  <th className="px-4 py-3 text-right">Bonus</th>
                  <th className="px-4 py-3 text-right">Deduction</th>
                  <th className="px-4 py-3 text-right">Net</th>
                  <th className="px-4 py-3">Bank</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border/40 last:border-0"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-foreground">
                        {item.employeeName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.payslipNumber}
                        {item.role ? ` · ${item.role}` : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums">
                      {formatNaira(item.grossAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums">
                      {formatNaira(item.bonusAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums">
                      {formatNaira(item.deductionAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium tabular-nums">
                      {formatNaira(item.netAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {maskAccountNumber(item.accountNumber)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        {run.status === "draft" ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-lg"
                            onClick={() => openEdit(item)}
                          >
                            <Pencil className="size-3.5" aria-hidden />
                            Edit
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
                          render={
                            <a
                              href={`/api/admin/payroll/items/${item.id}/payslip`}
                              target="_blank"
                              rel="noreferrer"
                            />
                          }
                        >
                          <Download className="size-3.5" aria-hidden />
                          Payslip
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Dialog
        open={editItem != null}
        onOpenChange={(open) => {
          if (!open) setEditItem(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit payroll line</DialogTitle>
            <DialogDescription>
              {editItem ? editItem.employeeName : null}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => void saveItem(event)} className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium">Gross</label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={gross}
                  onChange={(event) => setGross(event.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Bonus</label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={bonus}
                  onChange={(event) => setBonus(event.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Deduction
                </label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={deduction}
                  onChange={(event) => setDeduction(event.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium">
                Deduction note
              </label>
              <Input
                value={deductionNote}
                onChange={(event) => setDeductionNote(event.target.value)}
                placeholder="e.g. PAYE + pension"
                className="h-10 rounded-xl"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium">Notes</label>
              <Input
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setEditItem(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark payroll as paid</DialogTitle>
            <DialogDescription>
              Creates one salary expense of {formatNaira(run.netTotal)} so P&amp;L
              stays in sync.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => void handleMarkPaid(event)} className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium">Paid date</label>
              <Input
                type="date"
                required
                value={paidAt}
                onChange={(event) => setPaidAt(event.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium">
                Payment reference
              </label>
              <Input
                value={paymentReference}
                onChange={(event) => setPaymentReference(event.target.value)}
                placeholder={`PAYROLL-${run.label}`}
                className="h-10 rounded-xl"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setPayOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
                disabled={saving}
              >
                {saving ? "Saving..." : "Mark paid"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete payroll run?</DialogTitle>
            <DialogDescription>
              This permanently removes {run.label} and all payslip lines.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-xl"
              disabled={isPending}
              onClick={() => void handleDelete()}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
