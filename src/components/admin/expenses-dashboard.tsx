"use client"

import { useMemo, useState, type ComponentType, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import {
  ChevronRight,
  CircleDollarSign,
  Clock3,
  MoreHorizontal,
  Plus,
  Receipt,
  Search,
  Trash2,
  Wallet,
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
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_METHOD_LABELS,
  EXPENSE_STATUS_LABELS,
  type ExpenseCategory,
  type ExpenseMethod,
  type ExpenseStatus,
  type ExpenseView,
} from "@/lib/crm/expense-types"
import { formatNaira } from "@/lib/invoices/formatting"
import { parseAmountInput } from "@/lib/money"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

type ClientOption = {
  id: string
  company: string
}

type ProjectOption = {
  id: string
  name: string
  clientId: string | null
}

type ExpensesDashboardProps = {
  initialExpenses?: ExpenseView[]
  clients?: ClientOption[]
  projects?: ProjectOption[]
}

type StatusFilter = "all" | ExpenseStatus

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
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "reimbursed", label: "Reimbursed" },
]

function statusBadgeClass(status: ExpenseStatus) {
  switch (status) {
    case "paid":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
    case "pending":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400"
    case "reimbursed":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-400"
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

function ExpenseActionsMenu({
  expense,
  isPending,
  onDelete,
}: {
  expense: ExpenseView
  isPending: boolean
  onDelete: () => void
}) {
  return (
    <MenuPrimitive.Root modal={false}>
      <MenuPrimitive.Trigger
        disabled={isPending}
        aria-label={`Actions for expense ${expense.vendor || expense.id}`}
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

function isSameMonth(dateValue: string, reference = new Date()) {
  const date = new Date(`${dateValue}T00:00:00`)
  if (Number.isNaN(date.getTime())) return false
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth()
  )
}

export function ExpensesDashboard({
  initialExpenses = [],
  clients = [],
  projects = [],
}: ExpensesDashboardProps) {
  const router = useRouter()
  const [expenses, setExpenses] = useState(initialExpenses)
  const [query, setQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all")
  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ExpenseView | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState<ExpenseCategory | "">("")
  const [vendor, setVendor] = useState("")
  const [method, setMethod] = useState<ExpenseMethod>("bank_transfer")
  const [status, setStatus] = useState<ExpenseStatus>("paid")
  const [spentAt, setSpentAt] = useState("")
  const [clientId, setClientId] = useState("")
  const [projectId, setProjectId] = useState("")
  const [reference, setReference] = useState("")
  const [description, setDescription] = useState("")
  const [notes, setNotes] = useState("")
  const [receiptUrl, setReceiptUrl] = useState("")

  const filteredProjects = useMemo(() => {
    if (!clientId) return projects
    return projects.filter(
      (project) => !project.clientId || project.clientId === clientId
    )
  }, [clientId, projects])

  const counts = useMemo(
    () => ({
      all: expenses.length,
      paid: expenses.filter((item) => item.status === "paid").length,
      pending: expenses.filter((item) => item.status === "pending").length,
      reimbursed: expenses.filter((item) => item.status === "reimbursed")
        .length,
    }),
    [expenses]
  )

  const stats = useMemo(() => {
    const thisMonth = expenses
      .filter(
        (item) =>
          (item.status === "paid" || item.status === "reimbursed") &&
          isSameMonth(item.spentAt)
      )
      .reduce((sum, item) => sum + item.amount, 0)
    const pendingAmount = expenses
      .filter((item) => item.status === "pending")
      .reduce((sum, item) => sum + item.amount, 0)
    const paidTotal = expenses
      .filter((item) => item.status === "paid" || item.status === "reimbursed")
      .reduce((sum, item) => sum + item.amount, 0)

    return { thisMonth, pendingAmount, paidTotal }
  }, [expenses])

  const filteredExpenses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return expenses.filter((expense) => {
      const statusMatch =
        activeFilter === "all" || expense.status === activeFilter
      const searchMatch =
        !normalizedQuery ||
        [
          expense.vendor,
          expense.categoryLabel,
          expense.description,
          expense.notes,
          expense.reference,
          expense.clientName ?? "",
          expense.projectName ?? "",
        ].some((value) => value.toLowerCase().includes(normalizedQuery))

      return statusMatch && searchMatch
    })
  }, [activeFilter, expenses, query])

  function resetAddForm() {
    setAmount("")
    setCategory("")
    setVendor("")
    setMethod("bank_transfer")
    setStatus("paid")
    setSpentAt("")
    setClientId("")
    setProjectId("")
    setReference("")
    setDescription("")
    setNotes("")
    setReceiptUrl("")
  }

  async function handleAddExpense(event: FormEvent) {
    event.preventDefault()

    const parsedAmount = parseAmountInput(amount)
    if (!spentAt) {
      notify.error("Expense date is required.")
      return
    }
    if (!category) {
      notify.error("Expense category is required.")
      return
    }
    if (parsedAmount === null || parsedAmount <= 0) {
      notify.error("Enter a valid expense amount.")
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch("/api/admin/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clientId || null,
          projectId: projectId || null,
          amount: parsedAmount,
          category,
          vendor: vendor.trim(),
          method,
          status,
          spentAt,
          reference: reference.trim(),
          description: description.trim(),
          notes: notes.trim(),
          receiptUrl: receiptUrl.trim(),
        }),
      })

      const result = (await response.json().catch(() => null)) as {
        error?: string
        expense?: ExpenseView
      } | null

      if (!response.ok || !result?.expense) {
        notify.error(result?.error ?? "Unable to save expense.")
        return
      }

      setExpenses((current) => [result.expense!, ...current])
      setAddOpen(false)
      resetAddForm()
      notify.success("Expense recorded.")
      router.refresh()
    } catch {
      notify.error("Unable to save expense right now.")
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteExpenseRecord(id: string) {
    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/expenses/${id}`, {
        method: "DELETE",
      })
      const result = (await response.json().catch(() => null)) as {
        error?: string
      } | null

      if (!response.ok) {
        notify.error(result?.error ?? "Unable to delete expense.")
        return
      }

      setExpenses((current) => current.filter((item) => item.id !== id))
      setDeleteTarget(null)
      notify.success("Expense deleted.")
      router.refresh()
    } catch {
      notify.error("Unable to delete expense right now.")
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
            <span>Expenses</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Expenses
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track business spend across tools, hosting, ads, contractors, and
            more.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setAddOpen(true)}
          className="h-11 shrink-0 gap-2 rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
        >
          <Plus className="size-4" aria-hidden />
          Record expense
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="This month"
          value={formatNaira(stats.thisMonth)}
          icon={Wallet}
          accent="bg-brand/10 text-brand"
          valueVariant="currency"
        />
        <StatCard
          label="All paid"
          value={formatNaira(stats.paidTotal)}
          icon={CircleDollarSign}
          accent="bg-emerald-500/10 text-emerald-600"
          valueVariant="currency"
        />
        <StatCard
          label="Pending"
          value={formatNaira(stats.pendingAmount)}
          icon={Clock3}
          accent="bg-amber-500/10 text-amber-600"
          valueVariant="currency"
        />
        <StatCard
          label="Records"
          value={String(expenses.length)}
          icon={Receipt}
          accent="bg-sky-500/10 text-sky-600"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border/60 px-4 pt-3 sm:px-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex gap-1 overflow-x-auto">
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
              placeholder="Search vendor, category..."
              className="h-10 rounded-xl pl-9"
            />
          </div>
        </div>

        {filteredExpenses.length > 0 ? (
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Vendor</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Client / Project</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <td className="px-5 py-4 whitespace-nowrap text-muted-foreground">
                      {expense.spentAtLabel}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-foreground">
                        {expense.vendor || "—"}
                      </p>
                      {expense.description ? (
                        <p className="mt-0.5 max-w-[220px] truncate text-xs text-muted-foreground">
                          {expense.description}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {expense.categoryLabel}
                    </td>
                    <td className="px-4 py-4 font-semibold tabular-nums text-foreground">
                      {formatNaira(expense.amount)}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      <p>{expense.clientName ?? "—"}</p>
                      {expense.projectName ? (
                        <p className="mt-0.5 text-xs">{expense.projectName}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {expense.methodLabel}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        className={cn(
                          "border-0 font-semibold uppercase",
                          statusBadgeClass(expense.status)
                        )}
                      >
                        {expense.statusLabel}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <ExpenseActionsMenu
                          expense={expense}
                          isPending={isSaving}
                          onDelete={() => setDeleteTarget(expense)}
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
            No expenses match your filters.
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
            <DialogTitle>Record expense</DialogTitle>
            <DialogDescription>
              Log an outbound business cost for tracking and reporting.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddExpense} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="expense-amount" className={labelClassName}>
                  Amount (₦)
                </label>
                <CurrencyInput
                  id="expense-amount"
                  value={amount}
                  onValueChange={setAmount}
                  placeholder="0.00"
                  className={fieldClassName}
                  required
                />
              </div>

              <div>
                <label htmlFor="expense-date" className={labelClassName}>
                  Expense date
                </label>
                <Input
                  id="expense-date"
                  type="date"
                  value={spentAt}
                  onChange={(event) => setSpentAt(event.target.value)}
                  className={fieldClassName}
                  required
                />
              </div>

              <div>
                <label htmlFor="expense-category" className={labelClassName}>
                  Category
                </label>
                <select
                  id="expense-category"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as ExpenseCategory | "")
                  }
                  className={selectClassName}
                  required
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {(
                    Object.entries(EXPENSE_CATEGORY_LABELS) as Array<
                      [ExpenseCategory, string]
                    >
                  ).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="expense-status" className={labelClassName}>
                  Status
                </label>
                <select
                  id="expense-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as ExpenseStatus)
                  }
                  className={selectClassName}
                >
                  {(
                    Object.entries(EXPENSE_STATUS_LABELS) as Array<
                      [ExpenseStatus, string]
                    >
                  ).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="expense-vendor" className={labelClassName}>
                  Vendor / payee
                </label>
                <Input
                  id="expense-vendor"
                  value={vendor}
                  onChange={(event) => setVendor(event.target.value)}
                  placeholder="Namecheap, Google Ads, contractor..."
                  className={fieldClassName}
                />
              </div>

              <div>
                <label htmlFor="expense-method" className={labelClassName}>
                  Method
                </label>
                <select
                  id="expense-method"
                  value={method}
                  onChange={(event) =>
                    setMethod(event.target.value as ExpenseMethod)
                  }
                  className={selectClassName}
                >
                  {(
                    Object.entries(EXPENSE_METHOD_LABELS) as Array<
                      [ExpenseMethod, string]
                    >
                  ).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="expense-reference" className={labelClassName}>
                  Reference
                </label>
                <Input
                  id="expense-reference"
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  placeholder="Transfer / receipt ref"
                  className={fieldClassName}
                />
              </div>

              <div>
                <label htmlFor="expense-client" className={labelClassName}>
                  Client{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <select
                  id="expense-client"
                  value={clientId}
                  onChange={(event) => {
                    setClientId(event.target.value)
                    setProjectId("")
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

              <div>
                <label htmlFor="expense-project" className={labelClassName}>
                  Project{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <select
                  id="expense-project"
                  value={projectId}
                  onChange={(event) => setProjectId(event.target.value)}
                  className={selectClassName}
                >
                  <option value="">Unassigned</option>
                  {filteredProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="expense-description" className={labelClassName}>
                  Description
                </label>
                <textarea
                  id="expense-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="What this expense covers..."
                  className={textareaClassName}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="expense-receipt" className={labelClassName}>
                  Receipt URL{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <Input
                  id="expense-receipt"
                  type="url"
                  value={receiptUrl}
                  onChange={(event) => setReceiptUrl(event.target.value)}
                  placeholder="https://..."
                  className={fieldClassName}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="expense-notes" className={labelClassName}>
                  Notes
                </label>
                <textarea
                  id="expense-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Optional internal notes..."
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
                {isSaving ? "Saving..." : "Save expense"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete expense?</DialogTitle>
            <DialogDescription>
              This will permanently remove{" "}
              {deleteTarget
                ? `${formatNaira(deleteTarget.amount)}${
                    deleteTarget.vendor ? ` · ${deleteTarget.vendor}` : ""
                  }`
                : "this expense"}
              .
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isSaving || !deleteTarget}
              onClick={() => {
                if (deleteTarget) void deleteExpenseRecord(deleteTarget.id)
              }}
            >
              {isSaving ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
