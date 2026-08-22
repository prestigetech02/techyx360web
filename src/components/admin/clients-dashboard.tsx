"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import {
  Archive,
  BriefcaseBusiness,
  Camera,
  ChevronRight,
  CircleDollarSign,
  Eye,
  Filter,
  FolderKanban,
  Globe,
  Loader2,
  Mail,
  MapPin,
  MoreVertical,
  Pencil,
  Phone,
  Plus,
  ReceiptText,
  Search,
  StickyNote,
  Trash2,
  TrendingUp,
  Upload,
  User,
  UserCheck,
  UserX,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AdminTablePagination } from "@/components/admin/admin-table-pagination"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  CLIENT_COMPANY_SIZES,
  clientWebsiteHref,
  type ClientNoteView,
  type ClientStatus,
  type ClientView,
} from "@/lib/crm/client-types"
import type {
  ClientListStats,
  ClientStatusFilter,
  ClientsFilterOptions,
  ClientsListFilters,
} from "@/lib/admin/clients-page"
import type { AdminPaginationMeta } from "@/lib/admin/pagination"
import {
  DEAL_STAGE_LABELS,
  type DealStage,
  type DealView,
} from "@/lib/crm/deal-types"
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_PURPOSE_LABELS,
  PAYMENT_STATUS_LABELS,
  type PaymentMethod,
  type PaymentPurpose,
  type PaymentStatus,
  type PaymentView,
} from "@/lib/crm/payment-types"
import type { ProjectView } from "@/lib/crm/project-types"
import { formatNaira } from "@/lib/invoices/formatting"
import type { InvoicePaymentOption } from "@/lib/invoices/types"
import { formatAmountFromNumber, parseAmountInput } from "@/lib/money"
import { CurrencyInput } from "@/components/ui/currency-input"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

type DetailTab = "overview" | "deals" | "projects" | "notes" | "payments"

const filterTabs: Array<{ value: ClientStatusFilter; label: string }> = [
  { value: "all", label: "All Clients" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "archived", label: "Archived" },
]

function buildClientsHref(
  pathname: string,
  updates: {
    status?: ClientStatusFilter
    page?: number
    q?: string
    industry?: string
    companySize?: string
    location?: string
  },
  current: {
    statusFilter: ClientStatusFilter
    listFilters: ClientsListFilters
    page: number
  }
) {
  const params = new URLSearchParams()
  const status = updates.status ?? current.statusFilter
  const q = updates.q !== undefined ? updates.q : current.listFilters.q
  const industry =
    updates.industry !== undefined ? updates.industry : current.listFilters.industry
  const companySize =
    updates.companySize !== undefined
      ? updates.companySize
      : current.listFilters.companySize
  const location =
    updates.location !== undefined ? updates.location : current.listFilters.location
  const filtersChanged =
    updates.status !== undefined ||
    updates.q !== undefined ||
    updates.industry !== undefined ||
    updates.companySize !== undefined ||
    updates.location !== undefined
  const page = updates.page ?? (filtersChanged ? 1 : current.page)

  if (status !== "all") params.set("status", status)
  if (q.trim()) params.set("q", q.trim())
  if (industry) params.set("industry", industry)
  if (companySize) params.set("companySize", companySize)
  if (location) params.set("location", location)
  if (page > 1) params.set("page", String(page))

  const search = params.toString()
  return search ? `${pathname}?${search}` : pathname
}

const detailTabs: Array<{ value: DetailTab; label: string }> = [
  { value: "overview", label: "Overview" },
  { value: "deals", label: "Deals" },
  { value: "projects", label: "Projects" },
  { value: "notes", label: "Notes" },
  { value: "payments", label: "Payments" },
]

const fieldClassName =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
const labelClassName = "mb-1.5 block text-xs font-medium text-foreground"
const selectClassName = cn(fieldClassName, "appearance-none")

function statusClass(status: ClientStatus) {
  switch (status) {
    case "active":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
    case "inactive":
      return "bg-red-500/10 text-red-700 dark:text-red-400"
    case "archived":
      return "bg-muted text-muted-foreground"
  }
}

async function readErrorMessage(response: Response, fallback: string) {
  const data = (await response.json().catch(() => null)) as {
    error?: string
  } | null
  return data?.error ?? fallback
}

function StatCard({
  label,
  value,
  change,
  icon: Icon,
  iconClass,
}: {
  label: string
  value: string
  change: string
  icon: React.ComponentType<{ className?: string }>
  iconClass: string
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full sm:size-12",
            iconClass
          )}
        >
          <Icon className="size-5 sm:size-6" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground sm:text-sm">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <TrendingUp className="size-3 text-emerald-600" aria-hidden />
            <span className="font-semibold text-emerald-600">{change}</span>
            <span>vs last month</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function EmptySection({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-10 text-center">
      <Icon className="mx-auto size-7 text-muted-foreground/60" aria-hidden />
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

function SectionHeading({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-bold text-foreground">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

const dealStageStyles: Record<DealStage, string> = {
  qualified: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  proposal: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  negotiation: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  won: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  lost: "bg-red-500/10 text-red-700 dark:text-red-400",
}

const paymentStatusStyles: Record<PaymentStatus, string> = {
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  failed: "bg-red-500/10 text-red-700 dark:text-red-400",
  refunded: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
}

function ClientDealsSection({ client }: { client: ClientView }) {
  const [deals, setDeals] = useState<DealView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [value, setValue] = useState("")
  const [stage, setStage] = useState<DealStage>("qualified")
  const [expectedCloseDate, setExpectedCloseDate] = useState("")
  const [notes, setNotes] = useState("")

  async function loadDeals() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/clients/${client.id}/deals`)
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(data?.error ?? "Unable to load deals.")
      }

      const data = (await response.json()) as { deals: DealView[] }
      setDeals(data.deals)
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load deals."
      )
      setDeals([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDeals()
  }, [client.id])

  function resetForm() {
    setTitle("")
    setValue("")
    setStage("qualified")
    setExpectedCloseDate("")
    setNotes("")
  }

  async function handleAddDeal(event: FormEvent) {
    event.preventDefault()
    const parsedValue = parseAmountInput(value)

    if (!title.trim()) {
      notify.error("Deal title is required.")
      return
    }
    if (parsedValue === null || parsedValue < 0) {
      notify.error("Enter a valid deal value.")
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/clients/${client.id}/deals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          value: parsedValue,
          stage,
          expectedCloseDate: expectedCloseDate || null,
          notes: notes.trim(),
        }),
      })

      const result = (await response.json().catch(() => null)) as {
        error?: string
        deal?: DealView
      } | null

      if (!response.ok || !result?.deal) {
        notify.error(result?.error ?? "Unable to save deal.")
        return
      }

      setDeals((current) => [result.deal!, ...current])
      setAddOpen(false)
      resetForm()
      notify.success("Deal created.")
    } catch {
      notify.error("Unable to save deal right now.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground">Deals</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Sales opportunities associated with {client.company}.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setAddOpen(true)}
          className="h-9 shrink-0 gap-1.5 rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
        >
          <Plus className="size-4" aria-hidden />
          Add deal
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading deals…</p>
      ) : error ? (
        <EmptySection
          icon={BriefcaseBusiness}
          title="Unable to load deals"
          description={error}
        />
      ) : deals.length === 0 ? (
        <EmptySection
          icon={BriefcaseBusiness}
          title="No deals yet"
          description="Create the first sales opportunity for this client."
        />
      ) : (
        <div className="space-y-3">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="rounded-xl border border-border/60 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">
                    {deal.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatNaira(deal.value)}
                    {deal.expectedCloseDateLabel
                      ? ` · Close ${deal.expectedCloseDateLabel}`
                      : ""}
                  </p>
                </div>
                <Badge
                  className={cn(
                    "shrink-0 border-0 font-medium",
                    dealStageStyles[deal.stage]
                  )}
                >
                  {deal.stageLabel}
                </Badge>
              </div>
              {deal.notes ? (
                <p className="mt-3 text-sm text-muted-foreground">{deal.notes}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add deal</DialogTitle>
            <DialogDescription>
              Create a sales opportunity for {client.company}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddDeal} className="space-y-3">
            <div>
              <label className={labelClassName} htmlFor="client-deal-title">
                Title
              </label>
              <Input
                id="client-deal-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className={fieldClassName}
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClassName} htmlFor="client-deal-value">
                  Value (₦)
                </label>
                <CurrencyInput
                  id="client-deal-value"
                  value={value}
                  onValueChange={setValue}
                  className={fieldClassName}
                  required
                />
              </div>
              <div>
                <label className={labelClassName} htmlFor="client-deal-stage">
                  Stage
                </label>
                <select
                  id="client-deal-stage"
                  value={stage}
                  onChange={(event) =>
                    setStage(event.target.value as DealStage)
                  }
                  className={cn(fieldClassName, "appearance-none")}
                >
                  {(
                    Object.entries(DEAL_STAGE_LABELS) as Array<[DealStage, string]>
                  ).map(([stageValue, label]) => (
                    <option key={stageValue} value={stageValue}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClassName} htmlFor="client-deal-close">
                Expected close date
              </label>
              <Input
                id="client-deal-close"
                type="date"
                value={expectedCloseDate}
                onChange={(event) => setExpectedCloseDate(event.target.value)}
                className={fieldClassName}
              />
            </div>
            <div>
              <label className={labelClassName} htmlFor="client-deal-notes">
                Notes
              </label>
              <textarea
                id="client-deal-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className={cn(
                  fieldClassName,
                  "min-h-[88px] resize-y py-2.5 leading-relaxed"
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
              >
                {saving ? "Saving..." : "Save deal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}

function ClientPaymentsSection({ client }: { client: ClientView }) {
  const [payments, setPayments] = useState<PaymentView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [amount, setAmount] = useState("")
  const [invoiceId, setInvoiceId] = useState("")
  const [invoiceOptions, setInvoiceOptions] = useState<InvoicePaymentOption[]>(
    []
  )
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  const [method, setMethod] = useState<PaymentMethod>("bank_transfer")
  const [status, setStatus] = useState<PaymentStatus>("completed")
  const [purpose, setPurpose] = useState<PaymentPurpose | "">("")
  const [paidAt, setPaidAt] = useState("")
  const [reference, setReference] = useState("")
  const [description, setDescription] = useState("")
  const [notes, setNotes] = useState("")

  async function loadPayments() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/clients/${client.id}/payments`)
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(data?.error ?? "Unable to load payments.")
      }

      const data = (await response.json()) as { payments: PaymentView[] }
      setPayments(data.payments)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load payments."
      )
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadPayments()
  }, [client.id])

  useEffect(() => {
    let cancelled = false
    setLoadingInvoices(true)

    void fetch(`/api/admin/clients/${client.id}/invoices`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load invoices.")
        return (await response.json()) as { invoices: InvoicePaymentOption[] }
      })
      .then((data) => {
        if (cancelled) return
        setInvoiceOptions(data.invoices)
      })
      .catch(() => {
        if (cancelled) return
        setInvoiceOptions([])
      })
      .finally(() => {
        if (!cancelled) setLoadingInvoices(false)
      })

    return () => {
      cancelled = true
    }
  }, [client.id])

  function resetForm() {
    setAmount("")
    setInvoiceId("")
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

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/clients/${client.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedAmount,
          invoiceId: invoiceId || null,
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
      resetForm()
      notify.success("Payment recorded.")
    } catch {
      notify.error("Unable to save payment right now.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground">Payments</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Payment history for {client.company}.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setAddOpen(true)}
          className="h-9 shrink-0 gap-1.5 rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
        >
          <Plus className="size-4" aria-hidden />
          Record payment
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading payments…</p>
      ) : error ? (
        <EmptySection
          icon={ReceiptText}
          title="Unable to load payments"
          description={error}
        />
      ) : payments.length === 0 ? (
        <EmptySection
          icon={ReceiptText}
          title="No payments yet"
          description="Record the first payment received from this client."
        />
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="rounded-xl border border-border/60 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold tabular-nums text-foreground">
                    {formatNaira(payment.amount)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {payment.paidAtLabel} · {payment.purposeLabel} ·{" "}
                    {payment.methodLabel}
                    {payment.invoiceNumber
                      ? ` · ${payment.invoiceNumber}`
                      : ""}
                    {payment.reference ? ` · ${payment.reference}` : ""}
                  </p>
                  {payment.description ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {payment.description}
                    </p>
                  ) : null}
                </div>
                <Badge
                  className={cn(
                    "shrink-0 border-0 font-medium",
                    paymentStatusStyles[payment.status]
                  )}
                >
                  {payment.statusLabel}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record payment</DialogTitle>
            <DialogDescription>
              Log a payment received from {client.company}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPayment} className="space-y-3">
            <div>
              <label className={labelClassName} htmlFor="client-pay-invoice">
                Invoice{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>
              <select
                id="client-pay-invoice"
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
                className={cn(fieldClassName, "appearance-none")}
                disabled={loadingInvoices}
              >
                <option value="">
                  {loadingInvoices
                    ? "Loading invoices..."
                    : invoiceOptions.length === 0
                      ? "No open invoices"
                      : "No invoice link"}
                </option>
                {invoiceOptions.map((invoice) => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.invoiceNumber} · {formatNaira(invoice.balance)} due
                    · {invoice.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClassName} htmlFor="client-pay-amount">
                  Amount (₦)
                </label>
                <CurrencyInput
                  id="client-pay-amount"
                  value={amount}
                  onValueChange={setAmount}
                  className={fieldClassName}
                  required
                />
              </div>
              <div>
                <label className={labelClassName} htmlFor="client-pay-date">
                  Payment date
                </label>
                <Input
                  id="client-pay-date"
                  type="date"
                  value={paidAt}
                  onChange={(event) => setPaidAt(event.target.value)}
                  className={fieldClassName}
                  required
                />
              </div>
              <div>
                <label className={labelClassName} htmlFor="client-pay-method">
                  Method
                </label>
                <select
                  id="client-pay-method"
                  value={method}
                  onChange={(event) =>
                    setMethod(event.target.value as PaymentMethod)
                  }
                  className={cn(fieldClassName, "appearance-none")}
                >
                  {(
                    Object.entries(PAYMENT_METHOD_LABELS) as Array<
                      [PaymentMethod, string]
                    >
                  ).map(([methodValue, label]) => (
                    <option key={methodValue} value={methodValue}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClassName} htmlFor="client-pay-status">
                  Status
                </label>
                <select
                  id="client-pay-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as PaymentStatus)
                  }
                  className={cn(fieldClassName, "appearance-none")}
                >
                  {(
                    Object.entries(PAYMENT_STATUS_LABELS) as Array<
                      [PaymentStatus, string]
                    >
                  ).map(([statusValue, label]) => (
                    <option key={statusValue} value={statusValue}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClassName} htmlFor="client-pay-purpose">
                Purpose
              </label>
              <select
                id="client-pay-purpose"
                value={purpose}
                onChange={(event) =>
                  setPurpose(event.target.value as PaymentPurpose | "")
                }
                className={cn(fieldClassName, "appearance-none")}
                required
              >
                <option value="" disabled>
                  Select purpose
                </option>
                {(
                  Object.entries(PAYMENT_PURPOSE_LABELS) as Array<
                    [PaymentPurpose, string]
                  >
                ).map(([purposeValue, label]) => (
                  <option key={purposeValue} value={purposeValue}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className={labelClassName}
                htmlFor="client-pay-description"
              >
                Description
              </label>
              <textarea
                id="client-pay-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What this payment covers..."
                className={cn(
                  fieldClassName,
                  "min-h-[88px] resize-y py-2.5 leading-relaxed"
                )}
              />
            </div>
            <div>
              <label className={labelClassName} htmlFor="client-pay-ref">
                Reference
              </label>
              <Input
                id="client-pay-ref"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                className={fieldClassName}
              />
            </div>
            <div>
              <label className={labelClassName} htmlFor="client-pay-notes">
                Notes
              </label>
              <textarea
                id="client-pay-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className={cn(
                  fieldClassName,
                  "min-h-[88px] resize-y py-2.5 leading-relaxed"
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
              >
                {saving ? "Saving..." : "Save payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}

const projectStatusStyles: Record<string, string> = {
  "In Progress": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  "On Hold": "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Overdue: "bg-red-500/10 text-red-700 dark:text-red-400",
}

function ClientProjectsSection({ client }: { client: ClientView }) {
  const [projects, setProjects] = useState<ProjectView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadProjects() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/admin/clients/${client.id}/projects`
        )
        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as {
            error?: string
          } | null
          throw new Error(data?.error ?? "Unable to load projects.")
        }

        const data = (await response.json()) as { projects: ProjectView[] }
        if (!cancelled) setProjects(data.projects)
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load projects."
          )
          setProjects([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadProjects()

    return () => {
      cancelled = true
    }
  }, [client.id])

  return (
    <section>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground">Projects</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Current delivery work and project progress for {client.company}.
          </p>
        </div>
        <Button
          className="h-9 shrink-0 gap-1.5 rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
          render={
            <Link href={`/admin/projects?client=${client.id}`} />
          }
        >
          <Plus className="size-4" aria-hidden />
          Add project
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading projects…</p>
      ) : error ? (
        <EmptySection
          icon={FolderKanban}
          title="Unable to load projects"
          description={error}
        />
      ) : projects.length === 0 ? (
        <EmptySection
          icon={FolderKanban}
          title="No projects yet"
          description="Create the first delivery project for this client."
        />
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/admin/projects?project=${project.id}`}
              className="block rounded-xl border border-border/60 p-4 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">
                    {project.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {project.category} · Due {project.dueDate}
                  </p>
                </div>
                <Badge
                  className={cn(
                    "shrink-0 border-0 font-medium",
                    projectStatusStyles[project.status] ??
                      "bg-muted text-muted-foreground"
                  )}
                >
                  {project.status}
                </Badge>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">
                    {project.progress}%
                  </span>
                  <span className="text-muted-foreground">Progress</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

function NotesSection({
  notes,
  noteInput,
  onNoteInputChange,
  onAddNote,
  saving,
}: {
  notes: ClientNoteView[]
  noteInput: string
  onNoteInputChange: (value: string) => void
  onAddNote: () => void
  saving: boolean
}) {
  return (
    <section>
      <SectionHeading
        title="Notes"
        description="Internal context and follow-up notes for this client."
      />

      <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
        <textarea
          value={noteInput}
          onChange={(event) => onNoteInputChange(event.target.value)}
          placeholder="Write a note..."
          rows={3}
          className="w-full resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <div className="mt-2 flex justify-end">
          <Button
            onClick={onAddNote}
            disabled={!noteInput.trim() || saving}
            className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
          >
            <Plus className="size-4" aria-hidden />
            {saving ? "Saving..." : "Add note"}
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {notes.length ? (
          notes.map((note) => (
            <article
              key={note.id}
              className="rounded-xl border border-border/60 bg-card p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                  <StickyNote className="size-4" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {note.content}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">{note.author}</span>
                    <span>{note.date}</span>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <EmptySection
            icon={StickyNote}
            title="No notes yet"
            description="Add the first internal note for this client."
          />
        )}
      </div>
    </section>
  )
}

function ClientAvatar({
  client,
  size = "md",
}: {
  client: Pick<ClientView, "initials" | "avatarClass" | "avatarUrl" | "company">
  size?: "sm" | "md" | "lg"
}) {
  const sizeClass =
    size === "lg" ? "size-14 text-base" : size === "sm" ? "size-9 text-xs" : "size-11 text-sm"

  if (client.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={client.avatarUrl}
        alt={`${client.company} avatar`}
        className={cn(
          "shrink-0 rounded-xl object-cover",
          sizeClass
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl font-bold",
        sizeClass,
        client.avatarClass
      )}
    >
      {client.initials}
    </div>
  )
}

function ClientDetailSheet({
  client,
  open,
  onOpenChange,
  onAddNote,
  onUpdate,
}: {
  client: ClientView | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddNote: (id: string, content: string) => Promise<void>
  onUpdate: (
    id: string,
    payload: Record<string, unknown>
  ) => Promise<ClientView | null>
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="admin-ui w-full gap-0 overflow-hidden p-0 data-[side=right]:w-full data-[side=right]:sm:w-[45vw] data-[side=right]:sm:max-w-[45vw]"
      >
        {client ? (
          <ClientDetailContent
            key={client.id}
            client={client}
            onAddNote={onAddNote}
            onUpdate={onUpdate}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function ClientDetailContent({
  client,
  onAddNote,
  onUpdate,
}: {
  client: ClientView
  onAddNote: (id: string, content: string) => Promise<void>
  onUpdate: (
    id: string,
    payload: Record<string, unknown>
  ) => Promise<ClientView | null>
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview")
  const [noteInput, setNoteInput] = useState("")
  const [savingNote, setSavingNote] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [company, setCompany] = useState(client.company)
  const [contact, setContact] = useState(client.contact)
  const [role, setRole] = useState(client.role)
  const [email, setEmail] = useState(client.email)
  const [phone, setPhone] = useState(client.phone)
  const [industry, setIndustry] = useState(client.industry)
  const [product, setProduct] = useState(client.product)
  const [website, setWebsite] = useState(
    client.website === "—" ? "" : client.website
  )
  const [location, setLocation] = useState(client.location)
  const [companySize, setCompanySize] = useState(client.companySize)
  const [status, setStatus] = useState<ClientStatus>(client.status)
  const [avatarUrl, setAvatarUrl] = useState(client.avatarUrl)

  const websiteHref = clientWebsiteHref(client.website)

  function openEditDialog() {
    setCompany(client.company)
    setContact(client.contact)
    setRole(client.role)
    setEmail(client.email)
    setPhone(client.phone)
    setIndustry(client.industry)
    setProduct(client.product)
    setWebsite(client.website === "—" ? "" : client.website)
    setLocation(client.location)
    setCompanySize(client.companySize)
    setStatus(client.status)
    setAvatarUrl(client.avatarUrl)
    setEditOpen(true)
  }

  async function uploadAvatar(file: File | null) {
    if (!file) return

    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("clientId", client.id)

      const response = await fetch("/api/admin/client-avatars", {
        method: "POST",
        body: formData,
      })
      const result = (await response.json()) as {
        error?: string
        url?: string
      }

      if (!response.ok || !result.url) {
        notify.error(result.error ?? "Unable to upload avatar.")
        return
      }

      setAvatarUrl(result.url)
      notify.success("Avatar uploaded.")
    } catch {
      notify.error("Unable to upload avatar right now.")
    } finally {
      setUploadingAvatar(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ""
    }
  }

  async function saveClient(event: FormEvent) {
    event.preventDefault()
    if (savingEdit) return

    setSavingEdit(true)
    try {
      const updated = await onUpdate(client.id, {
        company,
        contact_name: contact,
        role,
        email,
        phone,
        industry,
        product,
        website,
        location,
        company_size: companySize,
        status,
        avatar_url: avatarUrl,
      })

      if (updated) {
        setEditOpen(false)
      }
    } finally {
      setSavingEdit(false)
    }
  }

  async function addNote() {
    const content = noteInput.trim()
    if (!content || savingNote) return

    setSavingNote(true)
    try {
      await onAddNote(client.id, content)
      setNoteInput("")
    } finally {
      setSavingNote(false)
    }
  }

  return (
    <>
      <SheetHeader className="shrink-0 space-y-0 border-b border-border/60 p-5 pr-12 text-left">
        <div className="flex items-start gap-3">
          <ClientAvatar client={client} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <SheetTitle className="text-base font-bold text-foreground">
                {client.company}
              </SheetTitle>
              <Badge
                className={cn(
                  "border-0 capitalize",
                  statusClass(client.status)
                )}
              >
                {client.status}
              </Badge>
            </div>
            <SheetDescription className="mt-1">
              {client.product}
            </SheetDescription>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5 shrink-0 text-brand" aria-hidden />
              {client.location}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openEditDialog}
            className="h-9 shrink-0 gap-1.5 rounded-xl"
          >
            <Pencil className="size-3.5" aria-hidden />
            Edit
          </Button>
        </div>
      </SheetHeader>

      <div className="shrink-0 overflow-x-auto border-b border-border/60 px-5">
        <div className="flex min-w-max gap-1">
          {detailTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "shrink-0 border-b-2 px-3 py-3 text-sm font-semibold transition-colors",
                activeTab === tab.value
                  ? "border-brand text-brand"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-0 overflow-y-auto overscroll-contain p-5">
        {activeTab === "overview" ? (
          <>
            <section className="pb-5">
              <h3 className="text-sm font-bold text-foreground">
                Contact Person
              </h3>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <User className="size-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">
                    {client.contact}
                  </p>
                  <p className="text-xs text-muted-foreground">{client.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl text-brand"
                    render={<a href={`mailto:${client.email}`} />}
                    aria-label={`Email ${client.contact}`}
                  >
                    <Mail className="size-4" aria-hidden />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl text-brand"
                    render={
                      <a href={`tel:${client.phone.replace(/\s+/g, "")}`} />
                    }
                    aria-label={`Call ${client.contact}`}
                  >
                    <Phone className="size-4" aria-hidden />
                  </Button>
                </div>
              </div>
            </section>

            <section className="border-t border-border/60 py-5">
              <h3 className="text-sm font-bold text-foreground">Contact Info</h3>
              <ul className="mt-3 space-y-3">
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <Mail className="size-4 shrink-0 text-brand" aria-hidden />
                  <a
                    href={`mailto:${client.email}`}
                    className="truncate hover:underline"
                  >
                    {client.email}
                  </a>
                </li>
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <Phone className="size-4 shrink-0 text-brand" aria-hidden />
                  <a
                    href={`tel:${client.phone.replace(/\s+/g, "")}`}
                    className="hover:underline"
                  >
                    {client.phone}
                  </a>
                </li>
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <Globe className="size-4 shrink-0 text-brand" aria-hidden />
                  {websiteHref ? (
                    <a
                      href={websiteHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate hover:underline"
                    >
                      {client.website}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </li>
              </ul>
            </section>

            <section className="border-t border-border/60 pt-5">
              <h3 className="text-sm font-bold text-foreground">
                Company Details
              </h3>
              <dl className="mt-3 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Industry</dt>
                  <dd className="text-right font-medium text-foreground">
                    {client.industry}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Company Size</dt>
                  <dd className="text-right font-medium text-foreground">
                    {client.companySize}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Client Since</dt>
                  <dd className="text-right font-medium text-foreground">
                    {client.clientSince}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Last Activity</dt>
                  <dd className="text-right font-medium text-foreground">
                    {client.lastActivity}
                  </dd>
                </div>
              </dl>
            </section>
          </>
        ) : null}

        {activeTab === "deals" ? (
          <ClientDealsSection client={client} />
        ) : null}
        {activeTab === "projects" ? (
          <ClientProjectsSection client={client} />
        ) : null}
        {activeTab === "notes" ? (
          <NotesSection
            notes={client.notes ?? []}
            noteInput={noteInput}
            onNoteInputChange={setNoteInput}
            onAddNote={() => {
              void addNote()
            }}
            saving={savingNote}
          />
        ) : null}
        {activeTab === "payments" ? (
          <ClientPaymentsSection client={client} />
        ) : null}
      </div>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit client</DialogTitle>
            <DialogDescription>
              Update company details and avatar for {client.company}.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => void saveClient(event)}
            className="space-y-3"
          >
            <div>
              <p className={labelClassName}>Avatar</p>
              <div className="flex items-center gap-3 rounded-xl border border-border/60 p-3">
                <ClientAvatar
                  client={{
                    ...client,
                    avatarUrl,
                  }}
                  size="lg"
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    id={`client-avatar-${client.id}`}
                    onChange={(event) => {
                      void uploadAvatar(event.target.files?.[0] ?? null)
                    }}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 gap-1.5 rounded-xl"
                      disabled={uploadingAvatar || savingEdit}
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                      ) : (
                        <Upload className="size-4" aria-hidden />
                      )}
                      {uploadingAvatar ? "Uploading..." : "Upload avatar"}
                    </Button>
                    {avatarUrl ? (
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-9 gap-1.5 rounded-xl text-muted-foreground"
                        disabled={uploadingAvatar || savingEdit}
                        onClick={() => setAvatarUrl(null)}
                      >
                        <Camera className="size-4" aria-hidden />
                        Remove
                      </Button>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, WebP or GIF up to 2 MB.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="edit-client-company" className={labelClassName}>
                Company
              </label>
              <Input
                id="edit-client-company"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                className={fieldClassName}
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-client-contact" className={labelClassName}>
                  Contact person
                </label>
                <Input
                  id="edit-client-contact"
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  className={fieldClassName}
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-client-role" className={labelClassName}>
                  Role
                </label>
                <Input
                  id="edit-client-role"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className={fieldClassName}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-client-email" className={labelClassName}>
                  Email
                </label>
                <Input
                  id="edit-client-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={fieldClassName}
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-client-phone" className={labelClassName}>
                  Phone
                </label>
                <Input
                  id="edit-client-phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className={fieldClassName}
                  required
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="edit-client-industry"
                  className={labelClassName}
                >
                  Industry
                </label>
                <Input
                  id="edit-client-industry"
                  value={industry}
                  onChange={(event) => setIndustry(event.target.value)}
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="edit-client-product" className={labelClassName}>
                  Product
                </label>
                <Input
                  id="edit-client-product"
                  value={product}
                  onChange={(event) => setProduct(event.target.value)}
                  className={fieldClassName}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-client-website" className={labelClassName}>
                  Website
                </label>
                <Input
                  id="edit-client-website"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  className={fieldClassName}
                />
              </div>
              <div>
                <label
                  htmlFor="edit-client-location"
                  className={labelClassName}
                >
                  Location
                </label>
                <Input
                  id="edit-client-location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className={fieldClassName}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-client-size" className={labelClassName}>
                  Company size
                </label>
                <select
                  id="edit-client-size"
                  value={companySize}
                  onChange={(event) => setCompanySize(event.target.value)}
                  className={selectClassName}
                >
                  {CLIENT_COMPANY_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="edit-client-status" className={labelClassName}>
                  Status
                </label>
                <select
                  id="edit-client-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as ClientStatus)
                  }
                  className={selectClassName}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="rounded-xl"
                disabled={savingEdit || uploadingAvatar}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingEdit || uploadingAvatar}
                className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
              >
                {savingEdit ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ClientActionsMenu({
  client,
  onView,
  onActivate,
  onDeactivate,
  onArchive,
  onDelete,
}: {
  client: ClientView
  onView: () => void
  onActivate: () => void
  onDeactivate: () => void
  onArchive: () => void
  onDelete: () => void
}) {
  const menuItemClassName =
    "flex w-full cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground outline-none select-none data-highlighted:bg-muted data-disabled:pointer-events-none data-disabled:opacity-50"

  return (
    <MenuPrimitive.Root modal={false}>
      <MenuPrimitive.Trigger
        aria-label={`Open actions for ${client.company}`}
        className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <MoreVertical className="size-4" aria-hidden />
      </MenuPrimitive.Trigger>

      <MenuPrimitive.Portal>
        <MenuPrimitive.Positioner
          side="bottom"
          align="end"
          sideOffset={4}
          className="z-50 outline-none"
        >
          <MenuPrimitive.Popup className="min-w-48 overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none">
            <MenuPrimitive.Item className={menuItemClassName} onClick={onView}>
              <Eye className="size-4" aria-hidden />
              View
            </MenuPrimitive.Item>

            {client.status !== "active" ? (
              <MenuPrimitive.Item
                className={menuItemClassName}
                onClick={onActivate}
              >
                <UserCheck className="size-4" aria-hidden />
                Activate client
              </MenuPrimitive.Item>
            ) : null}

            {client.status === "active" ? (
              <MenuPrimitive.Item
                className={menuItemClassName}
                onClick={onDeactivate}
              >
                <UserX className="size-4" aria-hidden />
                Deactivate client
              </MenuPrimitive.Item>
            ) : null}

            {client.status !== "archived" ? (
              <MenuPrimitive.Item
                className={menuItemClassName}
                onClick={onArchive}
              >
                <Archive className="size-4" aria-hidden />
                Archive client
              </MenuPrimitive.Item>
            ) : null}

            <MenuPrimitive.Item
              className={cn(
                menuItemClassName,
                "text-destructive data-highlighted:bg-destructive/10"
              )}
              onClick={onDelete}
            >
              <Trash2 className="size-4" aria-hidden />
              Delete client
            </MenuPrimitive.Item>
          </MenuPrimitive.Popup>
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  )
}

type ClientsDashboardProps = {
  clients: ClientView[]
  initialClientId?: string | null
  fallbackClient?: ClientView | null
  stats: ClientListStats
  pagination: AdminPaginationMeta
  statusFilter: ClientStatusFilter
  listFilters: ClientsListFilters
  filterOptions: ClientsFilterOptions
  pathname: string
  query?: Record<string, string | undefined>
  totalDeals?: number
  totalRevenue?: number
}

export function ClientsDashboard({
  clients,
  initialClientId = null,
  fallbackClient = null,
  stats,
  pagination,
  statusFilter,
  listFilters,
  filterOptions,
  pathname,
  query = {},
  totalDeals = 0,
  totalRevenue = 0,
}: ClientsDashboardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState(listFilters.q)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [draftIndustry, setDraftIndustry] = useState(listFilters.industry)
  const [draftCompanySize, setDraftCompanySize] = useState(listFilters.companySize)
  const [draftLocation, setDraftLocation] = useState(listFilters.location)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(
    initialClientId
  )
  const [deleteTarget, setDeleteTarget] = useState<ClientView | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [company, setCompany] = useState("")
  const [contact, setContact] = useState("")
  const [role, setRole] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [industry, setIndustry] = useState("")
  const [product, setProduct] = useState("")
  const [website, setWebsite] = useState("")
  const [location, setLocation] = useState("")
  const [companySize, setCompanySize] = useState("11 - 50 employees")
  const [status, setStatus] = useState<ClientStatus>("active")

  useEffect(() => {
    if (initialClientId) {
      setSelectedClientId(initialClientId)
    }
  }, [initialClientId])

  useEffect(() => {
    setSearchQuery(listFilters.q)
    setDraftIndustry(listFilters.industry)
    setDraftCompanySize(listFilters.companySize)
    setDraftLocation(listFilters.location)
  }, [listFilters])

  useEffect(() => {
    const trimmed = searchQuery.trim()
    if (trimmed === listFilters.q.trim()) return

    const timeout = window.setTimeout(() => {
      startTransition(() => {
        router.push(
          buildClientsHref(
            pathname,
            { q: trimmed },
            {
              statusFilter,
              listFilters,
              page: pagination.page,
            }
          )
        )
      })
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [
    listFilters,
    pagination.page,
    pathname,
    router,
    searchQuery,
    startTransition,
    statusFilter,
  ])

  const selectedClient = useMemo(() => {
    if (!selectedClientId) return null
    return (
      clients.find((client) => client.id === selectedClientId) ??
      (fallbackClient?.id === selectedClientId ? fallbackClient : null)
    )
  }, [clients, fallbackClient, selectedClientId])

  useEffect(() => {
    if (
      selectedClientId &&
      !clients.some((client) => client.id === selectedClientId) &&
      fallbackClient?.id !== selectedClientId
    ) {
      setSelectedClientId(null)
    }
  }, [clients, fallbackClient, selectedClientId])

  const statusCounts = {
    all: stats.total,
    active: stats.active,
    inactive: stats.inactive,
    archived: stats.archived,
  }

  const industryOptions = filterOptions.industries
  const locationOptions = filterOptions.locations

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (listFilters.industry) count += 1
    if (listFilters.companySize) count += 1
    if (listFilters.location) count += 1
    return count
  }, [listFilters.companySize, listFilters.industry, listFilters.location])

  const paginationQuery = {
    ...query,
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    ...(listFilters.q ? { q: listFilters.q } : {}),
    ...(listFilters.industry ? { industry: listFilters.industry } : {}),
    ...(listFilters.companySize ? { companySize: listFilters.companySize } : {}),
    ...(listFilters.location ? { location: listFilters.location } : {}),
  }

  function openFiltersDialog() {
    setDraftIndustry(listFilters.industry)
    setDraftCompanySize(listFilters.companySize)
    setDraftLocation(listFilters.location)
    setFiltersOpen(true)
  }

  function applyFilters() {
    startTransition(() => {
      router.push(
        buildClientsHref(
          pathname,
          {
            industry: draftIndustry,
            companySize: draftCompanySize,
            location: draftLocation,
          },
          {
            statusFilter,
            listFilters,
            page: pagination.page,
          }
        )
      )
    })
    setFiltersOpen(false)
  }

  function clearFilters() {
    setDraftIndustry("")
    setDraftCompanySize("")
    setDraftLocation("")
    setFiltersOpen(false)
    startTransition(() => {
      router.push(
        buildClientsHref(
          pathname,
          { industry: "", companySize: "", location: "" },
          {
            statusFilter,
            listFilters,
            page: pagination.page,
          }
        )
      )
    })
  }

  function refreshClients() {
    startTransition(() => {
      router.refresh()
    })
  }

  function resetAddForm() {
    setCompany("")
    setContact("")
    setRole("")
    setEmail("")
    setPhone("")
    setIndustry("")
    setProduct("")
    setWebsite("")
    setLocation("")
    setCompanySize("11 - 50 employees")
    setStatus("active")
  }

  async function handleAddClient(event: FormEvent) {
    event.preventDefault()

    const trimmedCompany = company.trim()
    const trimmedContact = contact.trim()
    const trimmedEmail = email.trim()
    const trimmedPhone = phone.trim()

    if (!trimmedCompany || !trimmedContact || !trimmedEmail || !trimmedPhone) {
      notify.error("Company, contact person, email, and phone are required.")
      return
    }

    setCreating(true)
    try {
      const response = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: trimmedCompany,
          contact_name: trimmedContact,
          email: trimmedEmail,
          phone: trimmedPhone,
          role: role.trim() || null,
          industry: industry.trim() || null,
          product: product.trim() || null,
          website: website.trim() || null,
          location: location.trim() || null,
          company_size: companySize,
          status,
        }),
      })

      if (!response.ok) {
        notify.error(
          await readErrorMessage(response, "Unable to create client.")
        )
        return
      }

      const data = (await response.json()) as { client?: ClientView }
      setAddDialogOpen(false)
      resetAddForm()
      if (data.client?.id) {
        setSelectedClientId(data.client.id)
      }
      notify.success("Client added.")
      refreshClients()
    } finally {
      setCreating(false)
    }
  }

  async function updateClient(
    id: string,
    payload: Record<string, unknown>
  ): Promise<ClientView | null> {
    const response = await fetch(`/api/admin/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      notify.error(await readErrorMessage(response, "Unable to update client."))
      return null
    }

    const data = (await response.json()) as { client?: ClientView }
    notify.success("Client updated.")
    refreshClients()
    return data.client ?? null
  }

  async function updateClientStatus(id: string, nextStatus: ClientStatus) {
    const response = await fetch(`/api/admin/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    })

    if (!response.ok) {
      notify.error(await readErrorMessage(response, "Unable to update client."))
      return
    }

    notify.success(
      nextStatus === "active"
        ? "Client activated."
        : nextStatus === "inactive"
          ? "Client deactivated."
          : "Client archived."
    )
    refreshClients()
  }

  async function deleteClient(id: string) {
    const response = await fetch(`/api/admin/clients/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      notify.error(await readErrorMessage(response, "Unable to delete client."))
      return
    }

    setDeleteTarget(null)
    if (selectedClientId === id) setSelectedClientId(null)
    notify.success("Client deleted.")
    refreshClients()
  }

  async function addNote(id: string, content: string) {
    const response = await fetch(`/api/admin/clients/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })

    if (!response.ok) {
      notify.error(await readErrorMessage(response, "Unable to add note."))
      return
    }

    notify.success("Note added.")
    refreshClients()
  }

  return (
    <div className="min-w-0 space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span>CRM</span>
            <ChevronRight className="size-3.5" aria-hidden />
            <span>Clients</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Clients
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your clients and client relationships.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setAddDialogOpen(true)}
          className="h-11 shrink-0 gap-2 rounded-xl bg-brand px-5 text-brand-foreground hover:bg-brand/90"
        >
          <Plus className="size-4" aria-hidden />
          Add new client
        </Button>
      </div>

      <div className="min-w-0 space-y-6">
        <div className="grid min-w-0 grid-cols-4 gap-3">
          <StatCard
            label="Total Clients"
            value={String(statusCounts.all)}
            change="—"
            icon={Users}
            iconClass="bg-blue-500/10 text-blue-600"
          />
          <StatCard
            label="Active Clients"
            value={String(statusCounts.active)}
            change="—"
            icon={BriefcaseBusiness}
            iconClass="bg-violet-500/10 text-violet-600"
          />
          <StatCard
            label="Total Deals"
            value={String(totalDeals)}
            change="—"
            icon={FolderKanban}
            iconClass="bg-emerald-500/10 text-emerald-600"
          />
          <StatCard
            label="Total Revenue"
            value={formatNaira(totalRevenue)}
            change="—"
            icon={CircleDollarSign}
            iconClass="bg-orange-500/10 text-orange-600"
          />
        </div>

        <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border/60 px-4 pt-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 gap-1 overflow-x-auto">
              {filterTabs.map((tab) => (
                <Link
                  key={tab.value}
                  href={buildClientsHref(
                    pathname,
                    { status: tab.value },
                    {
                      statusFilter,
                      listFilters,
                      page: pagination.page,
                    }
                  )}
                  className={cn(
                    "shrink-0 border-b-2 px-3 py-3 text-xs font-semibold transition-colors sm:text-sm",
                    statusFilter === tab.value
                      ? "border-brand text-brand"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label} ({statusCounts[tab.value]})
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2 pb-3 lg:pl-4">
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "h-10 rounded-xl px-3 text-muted-foreground",
                  activeFilterCount > 0 && "border-brand text-brand"
                )}
                onClick={openFiltersDialog}
              >
                <Filter className="size-4" aria-hidden />
                Filters
                {activeFilterCount > 0 ? (
                  <Badge className="ml-1 border-0 bg-brand/10 text-brand">
                    {activeFilterCount}
                  </Badge>
                ) : null}
              </Button>
              <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search clients..."
                  className="h-10 rounded-xl pl-9"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  <th className="px-5 py-3">Client / Company</th>
                  <th className="px-4 py-3">Contact Person</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedClientId(client.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        setSelectedClientId(client.id)
                      }
                    }}
                    className="cursor-pointer border-b border-border/40 transition-colors last:border-0 hover:bg-muted/25"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <ClientAvatar client={client} size="sm" />
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">
                            {client.company}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {client.industry}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-foreground">
                        {client.contact}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {client.role}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {client.email}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground">
                      {client.phone}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        className={cn(
                          "border-0 capitalize",
                          statusClass(client.status)
                        )}
                      >
                        {client.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div onClick={(event) => event.stopPropagation()}>
                        <ClientActionsMenu
                          client={client}
                          onView={() => setSelectedClientId(client.id)}
                          onActivate={() => {
                            void updateClientStatus(client.id, "active")
                          }}
                          onDeactivate={() => {
                            void updateClientStatus(client.id, "inactive")
                          }}
                          onArchive={() => {
                            void updateClientStatus(client.id, "archived")
                          }}
                          onDelete={() => setDeleteTarget(client)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {clients.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Search className="mx-auto size-8 text-muted-foreground/50" />
              <p className="mt-3 font-medium text-foreground">No clients found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {stats.total === 0 &&
                !listFilters.q &&
                activeFilterCount === 0 &&
                statusFilter === "all"
                  ? "Add your first client or convert a lead."
                  : "Try another search term or status."}
              </p>
            </div>
          ) : null}

          <AdminTablePagination
            pagination={pagination}
            pathname={pathname}
            query={paginationQuery}
          />
        </section>
      </div>

      <ClientDetailSheet
        client={selectedClient}
        open={selectedClient != null}
        onOpenChange={(open) => {
          if (!open) setSelectedClientId(null)
        }}
        onAddNote={addNote}
        onUpdate={updateClient}
      />

      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter clients</DialogTitle>
            <DialogDescription>
              Narrow the list by industry, company size, or location.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label htmlFor="client-filter-industry" className={labelClassName}>
                Industry
              </label>
              <select
                id="client-filter-industry"
                value={draftIndustry}
                onChange={(event) => setDraftIndustry(event.target.value)}
                className={selectClassName}
              >
                <option value="">All industries</option>
                {industryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="client-filter-size" className={labelClassName}>
                Company size
              </label>
              <select
                id="client-filter-size"
                value={draftCompanySize}
                onChange={(event) => setDraftCompanySize(event.target.value)}
                className={selectClassName}
              >
                <option value="">Any size</option>
                {CLIENT_COMPANY_SIZES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="client-filter-location"
                className={labelClassName}
              >
                Location
              </label>
              <select
                id="client-filter-location"
                value={draftLocation}
                onChange={(event) => setDraftLocation(event.target.value)}
                className={selectClassName}
              >
                <option value="">All locations</option>
                {locationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl"
              onClick={clearFilters}
            >
              Clear all
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setFiltersOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
                onClick={applyFilters}
              >
                Apply filters
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete client?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `“${deleteTarget.company}” will be removed permanently. Linked leads will keep their history but lose the client link.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={!deleteTarget || isPending}
              onClick={() => {
                if (deleteTarget) void deleteClient(deleteTarget.id)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={addDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open)
          if (!open) resetAddForm()
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add new client</DialogTitle>
            <DialogDescription>
              Create a client profile to track relationships and future deals.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddClient} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="client-company" className={labelClassName}>
                  Company
                </label>
                <Input
                  id="client-company"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  placeholder="e.g. Edwot School Management"
                  className={fieldClassName}
                  required
                />
              </div>
              <div>
                <label htmlFor="client-contact" className={labelClassName}>
                  Contact person
                </label>
                <Input
                  id="client-contact"
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  placeholder="Full name"
                  className={fieldClassName}
                  required
                />
              </div>
              <div>
                <label htmlFor="client-role" className={labelClassName}>
                  Role
                </label>
                <Input
                  id="client-role"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  placeholder="e.g. CTO"
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="client-email" className={labelClassName}>
                  Email
                </label>
                <Input
                  id="client-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@company.com"
                  className={fieldClassName}
                  required
                />
              </div>
              <div>
                <label htmlFor="client-phone" className={labelClassName}>
                  Phone
                </label>
                <Input
                  id="client-phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+234 800 000 0000"
                  className={fieldClassName}
                  required
                />
              </div>
              <div>
                <label htmlFor="client-industry" className={labelClassName}>
                  Industry
                </label>
                <Input
                  id="client-industry"
                  value={industry}
                  onChange={(event) => setIndustry(event.target.value)}
                  placeholder="e.g. Education"
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="client-product" className={labelClassName}>
                  Product / service
                </label>
                <Input
                  id="client-product"
                  value={product}
                  onChange={(event) => setProduct(event.target.value)}
                  placeholder="What you deliver for them"
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="client-website" className={labelClassName}>
                  Website
                </label>
                <Input
                  id="client-website"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  placeholder="www.company.com"
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="client-location" className={labelClassName}>
                  Location
                </label>
                <Input
                  id="client-location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Lagos, Nigeria"
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="client-size" className={labelClassName}>
                  Company size
                </label>
                <select
                  id="client-size"
                  value={companySize}
                  onChange={(event) => setCompanySize(event.target.value)}
                  className={selectClassName}
                >
                  {CLIENT_COMPANY_SIZES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="client-status" className={labelClassName}>
                  Status
                </label>
                <select
                  id="client-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as ClientStatus)
                  }
                  className={selectClassName}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                disabled={creating}
                onClick={() => setAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
                disabled={creating}
              >
                {creating ? "Creating..." : "Add client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
