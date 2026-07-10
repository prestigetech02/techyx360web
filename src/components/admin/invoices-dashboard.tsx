"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import {
  BadgeCheck,
  Banknote,
  Clock3,
  Eye,
  FileText,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
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
import type { InvoiceRow, InvoiceStatus } from "@/lib/invoices/types"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

type InvoicesDashboardProps = {
  invoices: InvoiceRow[]
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    dateStyle: "medium",
  })
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "draft":
      return "bg-muted text-muted-foreground"
    case "sent":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-400"
    case "paid":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
    case "overdue":
      return "bg-red-500/10 text-red-700 dark:text-red-400"
    case "cancelled":
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
  icon: React.ComponentType<{ className?: string }>
  accent: string
  valueVariant?: "default" | "currency"
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-3 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground sm:text-sm">{label}</p>
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

function InvoiceActionsMenu({
  invoice,
  isPending,
  onView,
  onEdit,
  onMarkSent,
  onMarkPaid,
  onDelete,
}: {
  invoice: InvoiceRow
  isPending: boolean
  onView: () => void
  onEdit: () => void
  onMarkSent: () => void
  onMarkPaid: () => void
  onDelete: () => void
}) {
  const menuItemClassName =
    "flex w-full cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground outline-none select-none data-highlighted:bg-muted data-disabled:pointer-events-none data-disabled:opacity-50"

  return (
    <MenuPrimitive.Root modal={false}>
      <MenuPrimitive.Trigger
        disabled={isPending}
        aria-label="Open invoice actions"
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
          <MenuPrimitive.Popup className="min-w-44 overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none">
            <MenuPrimitive.Item className={menuItemClassName} onClick={onView}>
              <Eye className="size-4" aria-hidden />
              View
            </MenuPrimitive.Item>
            <MenuPrimitive.Item className={menuItemClassName} onClick={onEdit}>
              <Pencil className="size-4" aria-hidden />
              Edit
            </MenuPrimitive.Item>
            {invoice.status !== "sent" && invoice.status !== "paid" ? (
              <MenuPrimitive.Item
                className={menuItemClassName}
                onClick={onMarkSent}
              >
                <Send className="size-4" aria-hidden />
                Mark as sent
              </MenuPrimitive.Item>
            ) : null}
            {invoice.status !== "paid" ? (
              <MenuPrimitive.Item
                className={menuItemClassName}
                onClick={onMarkPaid}
              >
                <BadgeCheck className="size-4" aria-hidden />
                Mark as paid
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
              Delete
            </MenuPrimitive.Item>
          </MenuPrimitive.Popup>
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  )
}

export function InvoicesDashboard({ invoices }: InvoicesDashboardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deleteTarget, setDeleteTarget] = useState<InvoiceRow | null>(null)

  const stats = useMemo(() => {
    const total = invoices.length
    const paidInvoices = invoices.filter((item) => item.status === "paid")
    const outstandingInvoices = invoices.filter(
      (item) => item.status === "sent" || item.status === "overdue"
    )

    const paidAmount = paidInvoices.reduce(
      (sum, item) => sum + Number(item.total),
      0
    )
    const outstandingAmount = outstandingInvoices.reduce(
      (sum, item) => sum + Number(item.total),
      0
    )

    return {
      total,
      paidCount: paidInvoices.length,
      paidAmount,
      outstandingAmount,
    }
  }, [invoices])

  async function updateStatus(id: string, status: InvoiceStatus) {
    const response = await fetch(`/api/admin/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      notify.error(data?.error ?? "Unable to update invoice.")
      return
    }

    notify.success(
      status === "paid" ? "Invoice marked as paid." : "Invoice marked as sent."
    )
    startTransition(() => {
      router.refresh()
    })
  }

  async function deleteInvoice(id: string) {
    const response = await fetch(`/api/admin/invoices/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      notify.error(data?.error ?? "Unable to delete invoice.")
      return
    }

    setDeleteTarget(null)
    notify.success("Invoice deleted.")
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Total invoices"
          value={String(stats.total)}
          icon={FileText}
          accent="bg-brand/10 text-brand"
        />
        <StatCard
          label="Paid"
          value={String(stats.paidCount)}
          icon={BadgeCheck}
          accent="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
        />
        <StatCard
          label="Amount received"
          value={formatNaira(stats.paidAmount)}
          icon={Banknote}
          accent="bg-sky-500/10 text-sky-700 dark:text-sky-400"
          valueVariant="currency"
        />
        <StatCard
          label="Outstanding"
          value={formatNaira(stats.outstandingAmount)}
          icon={Clock3}
          accent="bg-amber-500/10 text-amber-700 dark:text-amber-400"
          valueVariant="currency"
        />
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Invoices</h2>
          <p className="text-sm text-muted-foreground">
            Client invoices and quotes issued by Techyx360.
          </p>
        </div>

        {invoices.length > 0 ? (
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <th className="px-6 py-3">Number</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Issue date</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/invoices/${invoice.id}`}
                        className="font-semibold text-foreground hover:text-brand"
                      >
                        {invoice.invoice_number}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-foreground/80">
                      {invoice.client_name}
                    </td>
                    <td className="max-w-[240px] px-4 py-4 text-muted-foreground">
                      <span title={invoice.title} className="block truncate">
                        {invoice.title}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">
                      {formatDate(invoice.issue_date)}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-foreground tabular-nums">
                      {formatNaira(Number(invoice.total))}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        className={cn(
                          "font-semibold uppercase",
                          statusBadgeClass(invoice.status)
                        )}
                      >
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <InvoiceActionsMenu
                          invoice={invoice}
                          isPending={isPending}
                          onView={() =>
                            router.push(`/admin/invoices/${invoice.id}`)
                          }
                          onEdit={() =>
                            router.push(`/admin/invoices/${invoice.id}/edit`)
                          }
                          onMarkSent={() =>
                            void updateStatus(invoice.id, "sent")
                          }
                          onMarkPaid={() =>
                            void updateStatus(invoice.id, "paid")
                          }
                          onDelete={() => setDeleteTarget(invoice)}
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
            No invoices yet. Create your first invoice to get started.
          </div>
        )}
      </div>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete invoice?</DialogTitle>
            <DialogDescription>
              This permanently removes invoice{" "}
              {deleteTarget ? deleteTarget.invoice_number : ""} and its line
              items. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isPending || !deleteTarget}
              onClick={() => {
                if (deleteTarget) {
                  void deleteInvoice(deleteTarget.id)
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
