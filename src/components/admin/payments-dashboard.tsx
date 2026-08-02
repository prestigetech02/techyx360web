"use client"

import { useEffect, useMemo, useState, type ComponentType, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import {
  Banknote,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CurrencyInput } from "@/components/ui/currency-input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { formatAmountFromNumber, parseAmountInput } from "@/lib/money"
import type { InvoicePaymentOption } from "@/lib/invoices/types"
import { formatNaira } from "@/lib/invoices/formatting"
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_PURPOSE_LABELS,
  PAYMENT_STATUS_LABELS,
  type PaymentMethod,
  type PaymentPurpose,
  type PaymentStatus,
  type PaymentView,
} from "@/lib/crm/payment-types"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

type ClientOption = {
  id: string
  company: string
}

type PaymentsDashboardProps = {
  initialPayments?: PaymentView[]
  clients?: ClientOption[]
}

type StatusFilter = "all" | PaymentStatus

const fieldClassName =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
const labelClassName = "mb-1.5 block text-xs font-medium text-foreground"
const selectClassName = cn(fieldClassName, "appearance-none")
const textareaClassName = cn(
  fieldClassName,
  "min-h-[88px] resize-y py-2.5 leading-relaxed"
)

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
]

function statusBadgeClass(status: PaymentStatus) {
  switch (status) {
    case "completed":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
    case "pending":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400"
    case "failed":
      return "bg-red-500/10 text-red-700 dark:text-red-400"
    case "refunded":
      return "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  valueVariant = "default",
}: {
  label: string
  value: string
  icon: ComponentType<{ className?: string }>
  accent: string
  valueVariant?: "default" | "currency"
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-3 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground sm:text-sm">
            {label}
          </p>
          <p
            className={cn(
              "mt-1 font-bold tracking-tight text-foreground sm:mt-2",
              valueVariant === "currency"
                ? "text-sm leading-snug tabular-nums sm:text-base lg:text-lg"
                : "text-xl sm:text-3xl"
            )}
            title={value}
          >
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg sm:size-10 sm:rounded-xl",
            accent
          )}
        >
          <Icon className="size-4 sm:size-5" aria-hidden />
        </div>
      </div>
    </div>
  )
}

function PaymentActionsMenu({
  payment,
  isPending,
  onDelete,
}: {
  payment: PaymentView
  isPending: boolean
  onDelete: () => void
}) {
  return (
    <MenuPrimitive.Root modal={false}>
      <MenuPrimitive.Trigger
        disabled={isPending}
        aria-label={`Actions for payment ${payment.reference || payment.id}`}
        className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
      >
        <MoreHorizontal className="size-4" aria-hidden />
      </MenuPrimitive.Trigger>
      <MenuPrimitive.Portal>
        <MenuPrimitive.Positioner
          side="bottom"
          align="end"
          sideOffset={4}
          className="z-50 outline-none"
        >
          <MenuPrimitive.Popup className="min-w-40 overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none">
            <MenuPrimitive.Item
              className="flex w-full cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive outline-none select-none data-highlighted:bg-destructive/10"
              onClick={onDelete}
            >
              <Trash2 className="size-4" aria-hidden />
              Delete
            </MenuPrimitive.Item>
          </MenuPrimitive.Popup>
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  )
}

export function PaymentsDashboard({
  initialPayments = [],
  clients = [],
}: PaymentsDashboardProps) {
  const router = useRouter()
  const [payments, setPayments] = useState(initialPayments)
  const [query, setQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all")
  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PaymentView | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [clientId, setClientId] = useState("")
  const [invoiceId, setInvoiceId] = useState("")
  const [invoiceOptions, setInvoiceOptions] = useState<InvoicePaymentOption[]>(
    []
  )
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState<PaymentMethod>("bank_transfer")
  const [status, setStatus] = useState<PaymentStatus>("completed")
  const [purpose, setPurpose] = useState<PaymentPurpose | "">("")
  const [paidAt, setPaidAt] = useState("")
  const [reference, setReference] = useState("")
  const [description, setDescription] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (!clientId) {
      setInvoiceOptions([])
      setInvoiceId("")
      return
    }

    let cancelled = false
    setLoadingInvoices(true)

    void fetch(`/api/admin/clients/${clientId}/invoices`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load invoices.")
        return (await response.json()) as { invoices: InvoicePaymentOption[] }
      })
      .then((data) => {
        if (cancelled) return
        setInvoiceOptions(data.invoices)
        setInvoiceId((current) =>
          data.invoices.some((invoice) => invoice.id === current) ? current : ""
        )
      })
      .catch(() => {
        if (cancelled) return
        setInvoiceOptions([])
        setInvoiceId("")
      })
      .finally(() => {
        if (!cancelled) setLoadingInvoices(false)
      })

    return () => {
      cancelled = true
    }
  }, [clientId])

  const counts = useMemo(
    () => ({
      all: payments.length,
      completed: payments.filter((item) => item.status === "completed").length,
      pending: payments.filter((item) => item.status === "pending").length,
      failed: payments.filter((item) => item.status === "failed").length,
      refunded: payments.filter((item) => item.status === "refunded").length,
    }),
    [payments]
  )

  const stats = useMemo(() => {
    const received = payments
      .filter(
        (item) => item.status === "completed" && item.direction === "inbound"
      )
      .reduce((sum, item) => sum + item.amount, 0)
    const pendingAmount = payments
      .filter((item) => item.status === "pending")
      .reduce((sum, item) => sum + item.amount, 0)

    return { received, pendingAmount }
  }, [payments])

  const filteredPayments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return payments.filter((payment) => {
      const statusMatch =
        activeFilter === "all" || payment.status === activeFilter
      const searchMatch =
        !normalizedQuery ||
        [
          payment.clientName ?? "",
          payment.reference,
          payment.methodLabel,
          payment.purposeLabel,
          payment.invoiceNumber ?? "",
          payment.description,
          payment.notes,
        ].some((value) => value.toLowerCase().includes(normalizedQuery))

      return statusMatch && searchMatch
    })
  }, [activeFilter, payments, query])

  function resetAddForm() {
    setClientId("")
    setInvoiceId("")
    setInvoiceOptions([])
    setAmount("")
    setMethod("bank_transfer")
    setStatus("completed")
    setPurpose("")
    setPaidAt("")
    setReference("")
    setDescription("")
    setNotes("")
  }

  async function handleAddPayment(event: FormEvent) {
    event.preventDefault()

    const parsedAmount = parseAmountInput(amount)
    if (!paidAt) {
      notify.error("Payment date is required.")
      return
    }
    if (!purpose) {
      notify.error("Payment purpose is required.")
      return
    }
    if (parsedAmount === null || parsedAmount <= 0) {
      notify.error("Enter a valid payment amount.")
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clientId || null,
          invoiceId: invoiceId || null,
          amount: parsedAmount,
          method,
          status,
          purpose,
          paidAt,
          reference: reference.trim(),
          description: description.trim(),
          notes: notes.trim(),
          direction: "inbound",
        }),
      })

      const result = (await response.json().catch(() => null)) as {
        error?: string
        payment?: PaymentView
      } | null

      if (!response.ok || !result?.payment) {
        notify.error(result?.error ?? "Unable to save payment.")
        return
      }

      setPayments((current) => [result.payment!, ...current])
      setAddOpen(false)
      resetAddForm()
      notify.success("Payment recorded.")
      router.refresh()
    } catch {
      notify.error("Unable to save payment right now.")
    } finally {
      setIsSaving(false)
    }
  }

  async function deletePaymentRecord(id: string) {
    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/payments/${id}`, {
        method: "DELETE",
      })
      const result = (await response.json().catch(() => null)) as {
        error?: string
      } | null

      if (!response.ok) {
        notify.error(result?.error ?? "Unable to delete payment.")
        return
      }

      setPayments((current) => current.filter((item) => item.id !== id))
      setDeleteTarget(null)
      notify.success("Payment deleted.")
      router.refresh()
    } catch {
      notify.error("Unable to delete payment right now.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span>Finance</span>
            <ChevronRight className="size-3.5" aria-hidden />
            <span>Payments</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Payments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track received payments, reconcile transactions, and monitor pending
            amounts.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setAddOpen(true)}
          className="h-11 shrink-0 gap-2 rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
        >
          <Plus className="size-4" aria-hidden />
          Record payment
        </Button>
      </div>

      <div className="grid min-w-0 grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          label="Total payments"
          value={String(counts.all)}
          icon={Banknote}
          accent="bg-brand/10 text-brand"
        />
        <StatCard
          label="Amount received"
          value={formatNaira(stats.received)}
          icon={CheckCircle2}
          accent="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          valueVariant="currency"
        />
        <StatCard
          label="Pending"
          value={String(counts.pending)}
          icon={Clock3}
          accent="bg-amber-500/10 text-amber-700 dark:text-amber-400"
        />
        <StatCard
          label="Pending amount"
          value={formatNaira(stats.pendingAmount)}
          icon={Banknote}
          accent="bg-violet-500/10 text-violet-700 dark:text-violet-400"
          valueVariant="currency"
        />
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border/60 px-4 pt-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 gap-1 overflow-x-auto">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={cn(
                  "shrink-0 border-b-2 px-3 py-3 text-xs font-semibold transition-colors sm:text-sm",
                  activeFilter === filter.value
                    ? "border-brand text-brand"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {filter.label} ({counts[filter.value]})
              </button>
            ))}
          </div>

          <div className="relative pb-3 lg:min-w-[260px]">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search client, reference..."
              className="h-10 rounded-xl pl-9"
            />
          </div>
        </div>

        {filteredPayments.length > 0 ? (
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Purpose</th>
                  <th className="px-4 py-3 font-semibold">Invoice</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold">Reference</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <td className="px-5 py-4 whitespace-nowrap text-muted-foreground">
                      {payment.paidAtLabel}
                    </td>
                    <td className="px-4 py-4 font-medium text-foreground">
                      {payment.clientName ?? "—"}
                    </td>
                    <td className="px-4 py-4 font-semibold tabular-nums text-foreground">
                      {formatNaira(payment.amount)}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {payment.purposeLabel}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {payment.invoiceNumber ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {payment.methodLabel}
                    </td>
                    <td className="max-w-[180px] px-4 py-4 text-muted-foreground">
                      <span className="truncate" title={payment.reference}>
                        {payment.reference || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        className={cn(
                          "border-0 font-semibold uppercase",
                          statusBadgeClass(payment.status)
                        )}
                      >
                        {payment.statusLabel}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <PaymentActionsMenu
                          payment={payment}
                          isPending={isSaving}
                          onDelete={() => setDeleteTarget(payment)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No payments match your filters.
          </div>
        )}
      </div>

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open)
          if (!open) resetAddForm()
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Record payment</DialogTitle>
            <DialogDescription>
              Log an inbound payment against a client account.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddPayment} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="payment-client" className={labelClassName}>
                  Client
                </label>
                <select
                  id="payment-client"
                  value={clientId}
                  onChange={(event) => {
                    setClientId(event.target.value)
                    setInvoiceId("")
                  }}
                  className={selectClassName}
                >
                  <option value="">Unassigned</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.company}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="payment-invoice" className={labelClassName}>
                  Invoice{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <select
                  id="payment-invoice"
                  value={invoiceId}
                  onChange={(event) => {
                    const nextId = event.target.value
                    setInvoiceId(nextId)
                    const selected = invoiceOptions.find(
                      (invoice) => invoice.id === nextId
                    )
                    if (selected && !amount.trim()) {
                      setAmount(formatAmountFromNumber(selected.balance))
                    }
                  }}
                  className={selectClassName}
                  disabled={!clientId || loadingInvoices}
                >
                  <option value="">
                    {!clientId
                      ? "Select a client first"
                      : loadingInvoices
                        ? "Loading invoices..."
                        : invoiceOptions.length === 0
                          ? "No open invoices"
                          : "No invoice link"}
                  </option>
                  {invoiceOptions.map((invoice) => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.invoiceNumber} · {formatNaira(invoice.balance)}{" "}
                      due · {invoice.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="payment-amount" className={labelClassName}>
                  Amount (₦)
                </label>
                <CurrencyInput
                  id="payment-amount"
                  value={amount}
                  onValueChange={setAmount}
                  placeholder="0.00"
                  className={fieldClassName}
                  required
                />
              </div>

              <div>
                <label htmlFor="payment-date" className={labelClassName}>
                  Payment date
                </label>
                <Input
                  id="payment-date"
                  type="date"
                  value={paidAt}
                  onChange={(event) => setPaidAt(event.target.value)}
                  className={fieldClassName}
                  required
                />
              </div>

              <div>
                <label htmlFor="payment-method" className={labelClassName}>
                  Method
                </label>
                <select
                  id="payment-method"
                  value={method}
                  onChange={(event) =>
                    setMethod(event.target.value as PaymentMethod)
                  }
                  className={selectClassName}
                >
                  {(
                    Object.entries(PAYMENT_METHOD_LABELS) as Array<
                      [PaymentMethod, string]
                    >
                  ).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="payment-status" className={labelClassName}>
                  Status
                </label>
                <select
                  id="payment-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as PaymentStatus)
                  }
                  className={selectClassName}
                >
                  {(
                    Object.entries(PAYMENT_STATUS_LABELS) as Array<
                      [PaymentStatus, string]
                    >
                  ).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="payment-purpose" className={labelClassName}>
                  Purpose
                </label>
                <select
                  id="payment-purpose"
                  value={purpose}
                  onChange={(event) =>
                    setPurpose(event.target.value as PaymentPurpose | "")
                  }
                  className={selectClassName}
                  required
                >
                  <option value="" disabled>
                    Select purpose
                  </option>
                  {(
                    Object.entries(PAYMENT_PURPOSE_LABELS) as Array<
                      [PaymentPurpose, string]
                    >
                  ).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="payment-description" className={labelClassName}>
                  Description
                </label>
                <textarea
                  id="payment-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="What this payment covers..."
                  className={textareaClassName}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="payment-reference" className={labelClassName}>
                  Reference
                </label>
                <Input
                  id="payment-reference"
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  placeholder="Bank transfer reference"
                  className={fieldClassName}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="payment-notes" className={labelClassName}>
                  Notes
                </label>
                <textarea
                  id="payment-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Optional payment notes..."
                  className={textareaClassName}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90 disabled:opacity-70"
              >
                {isSaving ? "Saving..." : "Save payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete payment?</DialogTitle>
            <DialogDescription>
              This permanently removes{" "}
              {deleteTarget
                ? `${formatNaira(deleteTarget.amount)} from ${deleteTarget.clientName ?? "unassigned"}`
                : "this payment"}
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isSaving || !deleteTarget}
              onClick={() => {
                if (deleteTarget) {
                  void deletePaymentRecord(deleteTarget.id)
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
