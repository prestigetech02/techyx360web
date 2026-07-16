"use client"

import { useMemo, useState, type ComponentType, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  Globe,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatNaira } from "@/lib/invoices/formatting"
import { parseAmountInput } from "@/lib/money"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

type ServiceStatus = "active" | "overdue" | "expired" | "none"
type BillingCycle = "Monthly" | "Annually" | "Biennially"

type DomainAccount = {
  id: number
  clientName: string
  email: string
  phone: string
  domain: string
  registrar: string
  amount: number
  billingCycle: BillingCycle
  registeredAt: string
  expiresAt: string
  sslEnabled: boolean
  sslProvider: string
  sslAmount: number
  sslRegisteredAt: string
  sslExpiresAt: string
  notes: string
  initials: string
  accent: string
}

type StatusFilter = "all" | "active" | "overdue" | "expired"

const fieldClassName =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
const labelClassName = "mb-1.5 block text-xs font-medium text-foreground"
const selectClassName = cn(fieldClassName, "appearance-none")
const textareaClassName = cn(
  fieldClassName,
  "min-h-[88px] resize-y py-2.5 leading-relaxed"
)

const initialAccounts: DomainAccount[] = [
  {
    id: 1,
    clientName: "Edwot School Management",
    email: "kunle@edwot.com",
    phone: "+234 803 123 4567",
    domain: "edwot.com",
    registrar: "Namecheap",
    amount: 28000,
    billingCycle: "Annually",
    registeredAt: "2024-03-12",
    expiresAt: "2027-03-12",
    sslEnabled: true,
    sslProvider: "Sectigo PositiveSSL",
    sslAmount: 18000,
    sslRegisteredAt: "2025-03-12",
    sslExpiresAt: "2026-09-12",
    notes: "Domain + SSL managed together; renew SSL with hosting cycle.",
    initials: "E",
    accent: "bg-blue-600 text-white",
  },
  {
    id: 2,
    clientName: "Prime Logistics NG",
    email: "ops@primelogistics.ng",
    phone: "+234 809 441 2201",
    domain: "primelogistics.ng",
    registrar: "Whogohost",
    amount: 15000,
    billingCycle: "Annually",
    registeredAt: "2023-07-01",
    expiresAt: "2026-07-20",
    sslEnabled: true,
    sslProvider: "Let's Encrypt",
    sslAmount: 0,
    sslRegisteredAt: "2025-07-20",
    sslExpiresAt: "2026-07-20",
    notes: "Free SSL auto-renew; domain renewal needs client payment.",
    initials: "P",
    accent: "bg-violet-600 text-white",
  },
  {
    id: 3,
    clientName: "Amina Beauty Hub",
    email: "hello@aminabeauty.ng",
    phone: "+234 701 555 0192",
    domain: "aminabeauty.ng",
    registrar: "Namecheap",
    amount: 16500,
    billingCycle: "Annually",
    registeredAt: "2024-08-10",
    expiresAt: "2026-08-10",
    sslEnabled: true,
    sslProvider: "Namecheap EssentialSSL",
    sslAmount: 22000,
    sslRegisteredAt: "2025-08-10",
    sslExpiresAt: "2026-07-08",
    notes: "SSL due before domain; send combined reminder.",
    initials: "A",
    accent: "bg-rose-600 text-white",
  },
  {
    id: 4,
    clientName: "Northgate Clinics",
    email: "it@northgateclinics.com",
    phone: "+234 802 776 3340",
    domain: "northgateclinics.com",
    registrar: "GoDaddy",
    amount: 32000,
    billingCycle: "Biennially",
    registeredAt: "2022-11-09",
    expiresAt: "2026-06-28",
    sslEnabled: true,
    sslProvider: "DigiCert",
    sslAmount: 45000,
    sslRegisteredAt: "2025-06-28",
    sslExpiresAt: "2026-06-28",
    notes: "WHOIS privacy enabled. Invoice domain + SSL together.",
    initials: "N",
    accent: "bg-emerald-600 text-white",
  },
  {
    id: 5,
    clientName: "Lagos Craft Market",
    email: "admin@lagoscraft.market",
    phone: "+234 813 990 1188",
    domain: "lagoscraft.market",
    registrar: "Namecheap",
    amount: 42000,
    billingCycle: "Annually",
    registeredAt: "2023-05-22",
    expiresAt: "2026-05-22",
    sslEnabled: false,
    sslProvider: "",
    sslAmount: 0,
    sslRegisteredAt: "",
    sslExpiresAt: "",
    notes: "Domain expired. Client asked about adding SSL on reactivation.",
    initials: "L",
    accent: "bg-amber-600 text-white",
  },
]

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "overdue", label: "Overdue" },
  { value: "expired", label: "Expired" },
]

function parseDate(value: string) {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

function daysUntil(dateString: string) {
  const date = parseDate(dateString)
  if (!date) return 0
  const diff = date.getTime() - startOfToday().getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

function resolveStatus(expiresAt: string): Exclude<ServiceStatus, "none"> {
  const remaining = daysUntil(expiresAt)
  if (remaining < 0) return "expired"
  if (remaining <= 30) return "overdue"
  return "active"
}

function resolveSslStatus(account: DomainAccount): ServiceStatus {
  if (!account.sslEnabled || !account.sslExpiresAt) return "none"
  return resolveStatus(account.sslExpiresAt)
}

function resolveOverallStatus(
  account: DomainAccount
): Exclude<ServiceStatus, "none"> {
  const domainStatus = resolveStatus(account.expiresAt)
  const sslStatus = resolveSslStatus(account)

  const rank = { expired: 0, overdue: 1, active: 2 } as const
  if (sslStatus === "none") return domainStatus
  return rank[sslStatus] < rank[domainStatus] ? sslStatus : domainStatus
}

function formatDisplayDate(dateString: string) {
  const date = parseDate(dateString)
  if (!date) return dateString || "—"
  return date.toLocaleDateString(undefined, { dateStyle: "medium" })
}

function statusBadgeClass(status: ServiceStatus) {
  switch (status) {
    case "active":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
    case "overdue":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400"
    case "expired":
      return "bg-red-500/10 text-red-700 dark:text-red-400"
    case "none":
      return "bg-muted text-muted-foreground"
  }
}

function statusLabel(status: ServiceStatus) {
  switch (status) {
    case "active":
      return "Active"
    case "overdue":
      return "Overdue"
    case "expired":
      return "Expired"
    case "none":
      return "No SSL"
  }
}

function expiryHint(expiresAt: string) {
  const remaining = daysUntil(expiresAt)
  if (remaining < 0) {
    return `Expired ${Math.abs(remaining)} day${Math.abs(remaining) === 1 ? "" : "s"} ago`
  }
  if (remaining === 0) return "Expires today"
  if (remaining === 1) return "Expires tomorrow"
  if (remaining <= 30) return `Expires in ${remaining} days`
  return `Renews ${formatDisplayDate(expiresAt)}`
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "D"
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

const accentPalette = [
  "bg-blue-600 text-white",
  "bg-violet-600 text-white",
  "bg-rose-600 text-white",
  "bg-emerald-600 text-white",
  "bg-amber-600 text-white",
  "bg-sky-600 text-white",
]

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: number | string
  icon: ComponentType<{ className?: string }>
  accent: string
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-3 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground sm:text-sm">
            {label}
          </p>
          <p className="mt-1 text-xl font-bold tracking-tight text-foreground sm:mt-2 sm:text-3xl">
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

function DomainActionsMenu({
  account,
  onView,
  onRemind,
  onInvoice,
  onDelete,
}: {
  account: DomainAccount
  onView: () => void
  onRemind: () => void
  onInvoice: () => void
  onDelete: () => void
}) {
  const menuItemClassName =
    "flex w-full cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground outline-none select-none data-highlighted:bg-muted data-disabled:pointer-events-none data-disabled:opacity-50"

  return (
    <MenuPrimitive.Root modal={false}>
      <MenuPrimitive.Trigger
        aria-label={`Actions for ${account.domain}`}
        className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={(event) => event.stopPropagation()}
      >
        <MoreHorizontal className="size-4" aria-hidden />
      </MenuPrimitive.Trigger>
      <MenuPrimitive.Portal>
        <MenuPrimitive.Positioner sideOffset={6} align="end" className="z-50">
          <MenuPrimitive.Popup className="min-w-48 origin-[var(--transform-origin)] rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg outline-none transition-[transform,scale,opacity] data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <MenuPrimitive.Item className={menuItemClassName} onClick={onView}>
              <Eye className="size-4" aria-hidden />
              View details
            </MenuPrimitive.Item>
            <MenuPrimitive.Item
              className={menuItemClassName}
              onClick={onRemind}
            >
              <Bell className="size-4" aria-hidden />
              Send payment reminder
            </MenuPrimitive.Item>
            <MenuPrimitive.Item
              className={menuItemClassName}
              onClick={onInvoice}
            >
              <FileText className="size-4" aria-hidden />
              Generate invoice
            </MenuPrimitive.Item>
            <MenuPrimitive.Separator className="my-1.5 h-px bg-border" />
            <MenuPrimitive.Item
              className={cn(menuItemClassName, "text-red-600")}
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

function DomainDetailSheet({
  account,
  open,
  onOpenChange,
  onRemind,
  onInvoice,
}: {
  account: DomainAccount | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRemind: (account: DomainAccount) => void
  onInvoice: (account: DomainAccount) => void
}) {
  if (!account) return null

  const domainStatus = resolveStatus(account.expiresAt)
  const sslStatus = resolveSslStatus(account)
  const overallStatus = resolveOverallStatus(account)
  const totalAmount =
    account.amount + (account.sslEnabled ? account.sslAmount : 0)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="admin-ui w-full gap-0 overflow-hidden p-0 data-[side=right]:w-full data-[side=right]:sm:w-[45vw] data-[side=right]:sm:max-w-[45vw]"
      >
        <SheetHeader className="shrink-0 space-y-0 border-b border-border/60 p-5 pr-12 text-left">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                account.accent
              )}
            >
              {account.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <SheetTitle className="text-base font-bold text-foreground">
                  {account.domain}
                </SheetTitle>
                <Badge
                  className={cn(
                    "border-0 font-semibold uppercase",
                    statusBadgeClass(overallStatus)
                  )}
                >
                  {statusLabel(overallStatus)}
                </Badge>
              </div>
              <SheetDescription className="mt-1">
                {account.clientName}
              </SheetDescription>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Globe className="size-3.5 shrink-0 text-brand" aria-hidden />
                {account.registrar}
                {account.sslEnabled ? " · SSL included" : ""}
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5">
          <section className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">Total amount</p>
              <p className="mt-1 text-lg font-bold text-foreground">
                {formatNaira(totalAmount)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Domain{account.sslEnabled ? " + SSL" : ""}
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">Domain expiry</p>
              <p
                className={cn(
                  "mt-1 text-sm font-semibold",
                  domainStatus === "expired"
                    ? "text-red-600"
                    : domainStatus === "overdue"
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-foreground"
                )}
              >
                {formatDisplayDate(account.expiresAt)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {expiryHint(account.expiresAt)}
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-bold text-foreground">Client</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Email
                </p>
                <a
                  href={`mailto:${account.email}`}
                  className="mt-1 block text-sm text-brand hover:underline"
                >
                  {account.email}
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Phone
                </p>
                <a
                  href={`tel:${account.phone}`}
                  className="mt-1 block text-sm text-foreground hover:underline"
                >
                  {account.phone}
                </a>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-bold text-foreground">Domain</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/60 p-3">
                <p className="text-xs text-muted-foreground">Registered</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {formatDisplayDate(account.registeredAt)}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 p-3">
                <p className="text-xs text-muted-foreground">Registrar</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {account.registrar}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 p-3">
                <p className="text-xs text-muted-foreground">Domain fee</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {formatNaira(account.amount)}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 p-3">
                <p className="text-xs text-muted-foreground">Billing</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {account.billingCycle}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 p-3 sm:col-span-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">Domain status</p>
                  <Badge
                    className={cn(
                      "border-0 font-semibold uppercase",
                      statusBadgeClass(domainStatus)
                    )}
                  >
                    {statusLabel(domainStatus)}
                  </Badge>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-brand" aria-hidden />
              <h3 className="text-sm font-bold text-foreground">SSL service</h3>
            </div>
            {account.sslEnabled ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border/60 p-3 sm:col-span-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Provider</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {account.sslProvider}
                      </p>
                    </div>
                    <Badge
                      className={cn(
                        "border-0 font-semibold uppercase",
                        statusBadgeClass(sslStatus)
                      )}
                    >
                      {statusLabel(sslStatus)}
                    </Badge>
                  </div>
                </div>
                <div className="rounded-xl border border-border/60 p-3">
                  <p className="text-xs text-muted-foreground">SSL fee</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {account.sslAmount > 0
                      ? formatNaira(account.sslAmount)
                      : "Free"}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 p-3">
                  <p className="text-xs text-muted-foreground">SSL expiry</p>
                  <p
                    className={cn(
                      "mt-1 text-sm font-semibold",
                      sslStatus === "expired"
                        ? "text-red-600"
                        : sslStatus === "overdue"
                          ? "text-amber-700 dark:text-amber-400"
                          : "text-foreground"
                    )}
                  >
                    {formatDisplayDate(account.sslExpiresAt)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {expiryHint(account.sslExpiresAt)}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 p-3 sm:col-span-2">
                  <p className="text-xs text-muted-foreground">SSL registered</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {formatDisplayDate(account.sslRegisteredAt)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                No SSL service attached to this domain yet.
              </div>
            )}
          </section>

          {account.notes ? (
            <section>
              <h3 className="text-sm font-bold text-foreground">Notes</h3>
              <p className="mt-2 rounded-xl bg-muted/40 p-4 text-sm leading-relaxed text-foreground/80">
                {account.notes}
              </p>
            </section>
          ) : null}
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-border/60 p-4">
          <Button
            type="button"
            className="h-11 min-w-0 gap-2 rounded-xl bg-brand px-3 text-brand-foreground hover:bg-brand/90"
            onClick={() => onRemind(account)}
          >
            <Bell className="size-4 shrink-0" aria-hidden />
            <span className="truncate">Send payment reminder</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 min-w-0 gap-2 rounded-xl px-3"
            onClick={() => onInvoice(account)}
          >
            <FileText className="size-4 shrink-0" aria-hidden />
            <span className="truncate">Generate invoice</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function DomainsDashboard() {
  const router = useRouter()
  const [accounts, setAccounts] = useState(initialAccounts)
  const [query, setQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all")
  const [selected, setSelected] = useState<DomainAccount | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DomainAccount | null>(null)

  const [clientName, setClientName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [domain, setDomain] = useState("")
  const [registrar, setRegistrar] = useState("")
  const [amount, setAmount] = useState("")
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("Annually")
  const [registeredAt, setRegisteredAt] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [sslEnabled, setSslEnabled] = useState(true)
  const [sslProvider, setSslProvider] = useState("")
  const [sslAmount, setSslAmount] = useState("")
  const [sslRegisteredAt, setSslRegisteredAt] = useState("")
  const [sslExpiresAt, setSslExpiresAt] = useState("")
  const [notes, setNotes] = useState("")

  const accountsWithStatus = useMemo(
    () =>
      accounts.map((account) => ({
        ...account,
        status: resolveOverallStatus(account),
        domainStatus: resolveStatus(account.expiresAt),
        sslStatus: resolveSslStatus(account),
      })),
    [accounts]
  )

  const counts = useMemo(() => {
    const withSsl = accountsWithStatus.filter((item) => item.sslEnabled).length
    return {
      all: accountsWithStatus.length,
      active: accountsWithStatus.filter((item) => item.status === "active")
        .length,
      overdue: accountsWithStatus.filter((item) => item.status === "overdue")
        .length,
      expired: accountsWithStatus.filter((item) => item.status === "expired")
        .length,
      withSsl,
    }
  }, [accountsWithStatus])

  const filteredAccounts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return accountsWithStatus.filter((account) => {
      const statusMatch =
        activeFilter === "all" || account.status === activeFilter
      const searchMatch =
        !normalizedQuery ||
        [
          account.clientName,
          account.domain,
          account.registrar,
          account.email,
          account.sslProvider,
        ].some((value) => value.toLowerCase().includes(normalizedQuery))

      return statusMatch && searchMatch
    })
  }, [accountsWithStatus, activeFilter, query])

  function resetAddForm() {
    setClientName("")
    setEmail("")
    setPhone("")
    setDomain("")
    setRegistrar("")
    setAmount("")
    setBillingCycle("Annually")
    setRegisteredAt("")
    setExpiresAt("")
    setSslEnabled(true)
    setSslProvider("")
    setSslAmount("")
    setSslRegisteredAt("")
    setSslExpiresAt("")
    setNotes("")
  }

  function handleAddAccount(event: FormEvent) {
    event.preventDefault()

    const parsedAmount = parseAmountInput(amount)
    const parsedSslAmount = sslEnabled ? parseAmountInput(sslAmount || "0") : 0

    if (
      !clientName.trim() ||
      !email.trim() ||
      !domain.trim() ||
      !registrar.trim() ||
      !registeredAt ||
      !expiresAt
    ) {
      notify.error("Fill in the required domain fields.")
      return
    }

    if (parsedAmount === null || parsedAmount <= 0) {
      notify.error("Enter a valid domain amount.")
      return
    }

    if (sslEnabled) {
      if (!sslProvider.trim() || !sslRegisteredAt || !sslExpiresAt) {
        notify.error("Fill in SSL provider and dates, or turn SSL off.")
        return
      }
      if (parsedSslAmount === null || parsedSslAmount < 0) {
        notify.error("Enter a valid SSL amount (0 for free SSL).")
        return
      }
    }

    const nextId = Math.max(0, ...accounts.map((item) => item.id)) + 1
    const next: DomainAccount = {
      id: nextId,
      clientName: clientName.trim(),
      email: email.trim(),
      phone: phone.trim() || "—",
      domain: domain.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""),
      registrar: registrar.trim(),
      amount: parsedAmount,
      billingCycle,
      registeredAt,
      expiresAt,
      sslEnabled,
      sslProvider: sslEnabled ? sslProvider.trim() : "",
      sslAmount: sslEnabled ? (parsedSslAmount ?? 0) : 0,
      sslRegisteredAt: sslEnabled ? sslRegisteredAt : "",
      sslExpiresAt: sslEnabled ? sslExpiresAt : "",
      notes: notes.trim(),
      initials: initialsFromName(clientName),
      accent: accentPalette[nextId % accentPalette.length],
    }

    setAccounts((current) => [next, ...current])
    setAddOpen(false)
    resetAddForm()
    notify.success("Domain account recorded.")
    setSelected(next)
  }

  function sendPaymentReminder(account: DomainAccount) {
    const domainStatus = resolveStatus(account.expiresAt)
    const sslStatus = resolveSslStatus(account)
    const sslLine = account.sslEnabled
      ? `\nSSL (${account.sslProvider}): ${
          sslStatus === "expired"
            ? `expired on ${formatDisplayDate(account.sslExpiresAt)}`
            : `due by ${formatDisplayDate(account.sslExpiresAt)}`
        } — ${account.sslAmount > 0 ? formatNaira(account.sslAmount) : "Free"}`
      : ""

    const subject = encodeURIComponent(
      `Domain renewal reminder — ${account.domain}`
    )
    const body = encodeURIComponent(
      [
        `Hi ${account.clientName},`,
        "",
        `This is a friendly reminder about services for ${account.domain}:`,
        "",
        `Domain (${account.registrar}): ${
          domainStatus === "expired"
            ? `expired on ${formatDisplayDate(account.expiresAt)}`
            : `due for renewal by ${formatDisplayDate(account.expiresAt)}`
        } — ${formatNaira(account.amount)} (${account.billingCycle}).${sslLine}`,
        "",
        "Please confirm payment so we can renew on your behalf.",
        "",
        "Thank you,",
        "Techyx360",
      ].join("\n")
    )

    window.open(`mailto:${account.email}?subject=${subject}&body=${body}`, "_blank")
    notify.success("Payment reminder drafted in your email client.")
  }

  function generateInvoice(account: DomainAccount) {
    const parts = [
      `Domain registration/renewal — ${account.domain} (${account.registrar})`,
    ]
    if (account.sslEnabled) {
      parts.push(
        `SSL certificate — ${account.sslProvider || "SSL"} for ${account.domain}`
      )
    }

    const total =
      account.amount + (account.sslEnabled ? account.sslAmount : 0)

    const params = new URLSearchParams({
      clientName: account.clientName,
      clientEmail: account.email,
      description: parts.join("; "),
      amount: String(total),
    })
    notify.success("Opening invoice form with domain details.")
    router.push(`/admin/invoices/new?${params.toString()}`)
  }

  function deleteAccount(id: number) {
    setAccounts((current) => current.filter((item) => item.id !== id))
    setDeleteTarget(null)
    if (selected?.id === id) setSelected(null)
    notify.success("Domain account removed.")
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span>Orders</span>
            <ChevronRight className="size-3.5" aria-hidden />
            <span>Domains</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Domains
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track client domain registrations, SSL certificates, renewals, and
            billing.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setAddOpen(true)}
          className="h-11 shrink-0 gap-2 rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
        >
          <Plus className="size-4" aria-hidden />
          Add domain
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total domains"
          value={counts.all}
          icon={Globe}
          accent="bg-brand/10 text-brand"
        />
        <StatCard
          label="Active"
          value={counts.active}
          icon={CheckCircle2}
          accent="bg-emerald-500/10 text-emerald-600"
        />
        <StatCard
          label="Overdue"
          value={counts.overdue}
          icon={AlertTriangle}
          accent="bg-amber-500/10 text-amber-600"
        />
        <StatCard
          label="With SSL"
          value={counts.withSsl}
          icon={ShieldCheck}
          accent="bg-sky-500/10 text-sky-600"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 flex-wrap gap-1">
            {statusFilters.map((filter) => {
              const count = counts[filter.value]
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                    activeFilter === filter.value
                      ? "bg-brand/10 text-brand"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {filter.label}
                  <span className="ml-1.5 tabular-nums text-xs opacity-70">
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search domain, client, registrar..."
              className="h-10 rounded-xl pl-9"
            />
          </div>
        </div>

        {filteredAccounts.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  <th className="px-5 py-3 font-semibold">Client / Domain</th>
                  <th className="px-4 py-3 font-semibold">Registrar</th>
                  <th className="px-4 py-3 font-semibold">SSL</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Domain expires</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredAccounts.map((account) => {
                  const total =
                    account.amount +
                    (account.sslEnabled ? account.sslAmount : 0)

                  return (
                    <tr
                      key={account.id}
                      className="cursor-pointer transition-colors hover:bg-muted/30"
                      onClick={() => setSelected(account)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                              account.accent
                            )}
                          >
                            {account.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">
                              {account.clientName}
                            </p>
                            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                              <Globe className="size-3 shrink-0" aria-hidden />
                              {account.domain}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-foreground">
                          {account.registrar}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {account.billingCycle}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        {account.sslEnabled ? (
                          <div>
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck
                                className="size-3.5 text-sky-600"
                                aria-hidden
                              />
                              <p className="truncate text-sm font-medium text-foreground">
                                {account.sslProvider || "SSL"}
                              </p>
                            </div>
                            <Badge
                              className={cn(
                                "mt-1 border-0 text-[10px] font-semibold uppercase",
                                statusBadgeClass(account.sslStatus)
                              )}
                            >
                              {statusLabel(account.sslStatus)}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No SSL
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold tabular-nums text-foreground">
                          {formatNaira(total)}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {account.sslEnabled
                            ? `Domain ${formatNaira(account.amount)}`
                            : "Domain only"}
                        </p>
                      </td>
                      <td
                        className={cn(
                          "whitespace-nowrap px-4 py-3.5 text-xs",
                          account.domainStatus === "expired"
                            ? "font-semibold text-red-600"
                            : account.domainStatus === "overdue"
                              ? "font-semibold text-amber-700 dark:text-amber-400"
                              : "text-muted-foreground"
                        )}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="size-3.5" aria-hidden />
                          {formatDisplayDate(account.expiresAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          className={cn(
                            "border-0 font-semibold uppercase",
                            statusBadgeClass(account.status)
                          )}
                        >
                          {statusLabel(account.status)}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <DomainActionsMenu
                          account={account}
                          onView={() => setSelected(account)}
                          onRemind={() => sendPaymentReminder(account)}
                          onInvoice={() => generateInvoice(account)}
                          onDelete={() => setDeleteTarget(account)}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No domain accounts match your filters.
          </div>
        )}
      </section>

      <DomainDetailSheet
        account={selected}
        open={selected != null}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
        onRemind={sendPaymentReminder}
        onInvoice={generateInvoice}
      />

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open)
          if (!open) resetAddForm()
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add domain</DialogTitle>
            <DialogDescription>
              Record a client domain registration and optional SSL certificate
              service.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAccount} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="domain-client" className={labelClassName}>
                  Client name
                </label>
                <Input
                  id="domain-client"
                  value={clientName}
                  onChange={(event) => setClientName(event.target.value)}
                  placeholder="e.g. Edwot School Management"
                  className={fieldClassName}
                  required
                />
              </div>
              <div>
                <label htmlFor="domain-email" className={labelClassName}>
                  Email
                </label>
                <Input
                  id="domain-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="client@email.com"
                  className={fieldClassName}
                  required
                />
              </div>
              <div>
                <label htmlFor="domain-phone" className={labelClassName}>
                  Phone
                </label>
                <Input
                  id="domain-phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+234 ..."
                  className={fieldClassName}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="domain-name" className={labelClassName}>
                  Domain
                </label>
                <Input
                  id="domain-name"
                  value={domain}
                  onChange={(event) => setDomain(event.target.value)}
                  placeholder="example.com"
                  className={fieldClassName}
                  required
                />
              </div>
              <div>
                <label htmlFor="domain-registrar" className={labelClassName}>
                  Registrar
                </label>
                <Input
                  id="domain-registrar"
                  value={registrar}
                  onChange={(event) => setRegistrar(event.target.value)}
                  placeholder="Namecheap, GoDaddy..."
                  className={fieldClassName}
                  required
                />
              </div>
              <div>
                <label htmlFor="domain-cycle" className={labelClassName}>
                  Billing cycle
                </label>
                <select
                  id="domain-cycle"
                  value={billingCycle}
                  onChange={(event) =>
                    setBillingCycle(event.target.value as BillingCycle)
                  }
                  className={selectClassName}
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Annually">Annually</option>
                  <option value="Biennially">Biennially</option>
                </select>
              </div>
              <div>
                <label htmlFor="domain-amount" className={labelClassName}>
                  Domain amount (₦)
                </label>
                <CurrencyInput
                  id="domain-amount"
                  value={amount}
                  onValueChange={setAmount}
                  placeholder="0.00"
                  className={fieldClassName}
                  required
                />
              </div>
              <div>
                <label htmlFor="domain-registered" className={labelClassName}>
                  Registered
                </label>
                <Input
                  id="domain-registered"
                  type="date"
                  value={registeredAt}
                  onChange={(event) => setRegisteredAt(event.target.value)}
                  className={fieldClassName}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="domain-expires" className={labelClassName}>
                  Domain expires
                </label>
                <Input
                  id="domain-expires"
                  type="date"
                  value={expiresAt}
                  onChange={(event) => setExpiresAt(event.target.value)}
                  className={fieldClassName}
                  required
                />
              </div>

              <div className="sm:col-span-2 rounded-xl border border-border/60 p-3">
                <label className="flex cursor-pointer items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <ShieldCheck className="size-4 text-brand" aria-hidden />
                    Include SSL service
                  </span>
                  <input
                    type="checkbox"
                    checked={sslEnabled}
                    onChange={(event) => setSslEnabled(event.target.checked)}
                    className="size-4 rounded border-border accent-[var(--brand,#0b2c66)]"
                  />
                </label>

                {sslEnabled ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="ssl-provider"
                        className={labelClassName}
                      >
                        SSL provider
                      </label>
                      <Input
                        id="ssl-provider"
                        value={sslProvider}
                        onChange={(event) => setSslProvider(event.target.value)}
                        placeholder="Sectigo, Let's Encrypt..."
                        className={fieldClassName}
                        required={sslEnabled}
                      />
                    </div>
                    <div>
                      <label htmlFor="ssl-amount" className={labelClassName}>
                        SSL amount (₦)
                      </label>
                      <CurrencyInput
                        id="ssl-amount"
                        value={sslAmount}
                        onValueChange={setSslAmount}
                        placeholder="0.00"
                        className={fieldClassName}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="ssl-registered"
                        className={labelClassName}
                      >
                        SSL registered
                      </label>
                      <Input
                        id="ssl-registered"
                        type="date"
                        value={sslRegisteredAt}
                        onChange={(event) =>
                          setSslRegisteredAt(event.target.value)
                        }
                        className={fieldClassName}
                        required={sslEnabled}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="ssl-expires" className={labelClassName}>
                        SSL expires
                      </label>
                      <Input
                        id="ssl-expires"
                        type="date"
                        value={sslExpiresAt}
                        onChange={(event) =>
                          setSslExpiresAt(event.target.value)
                        }
                        className={fieldClassName}
                        required={sslEnabled}
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="domain-notes" className={labelClassName}>
                  Notes
                </label>
                <textarea
                  id="domain-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="WHOIS privacy, DNS notes, renewal instructions..."
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
                className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
              >
                Save domain
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
            <DialogTitle>Delete domain account?</DialogTitle>
            <DialogDescription>
              This removes{" "}
              {deleteTarget
                ? `${deleteTarget.domain} for ${deleteTarget.clientName}`
                : "this domain account"}{" "}
              from your records. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) deleteAccount(deleteTarget.id)
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
