"use client"

import { FormEvent, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CurrencyInput } from "@/components/ui/currency-input"
import { DropdownField } from "@/components/ui/dropdown"
import { Input } from "@/components/ui/input"
import {
  invoicePaymentDefaults,
  invoiceSignatureDefaults,
  DEFAULT_VAT_RATE,
} from "@/config/invoice-defaults"
import {
  calculateInvoiceTotals,
  normalizeLineItemAmount,
} from "@/lib/invoices/calculations"
import { formatNaira } from "@/lib/invoices/formatting"
import {
  formatAmountFromNumber,
  parseAmountInput,
} from "@/lib/money"
import type {
  InvoiceDocumentType,
  InvoiceLineItemType,
  InvoiceStatus,
} from "@/lib/invoices/types"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

const fieldClassName =
  "h-11 w-full rounded-xl border-border bg-background px-3.5 text-sm md:text-sm"
const textareaClassName =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
const labelClassName = "mb-2 block text-sm font-medium text-foreground"

type LineItemDraft = {
  key: string
  description: string
  amount: string
  type: InvoiceLineItemType
}

export type InvoiceFormInitialValues = {
  invoiceNumber: string
  documentType: InvoiceDocumentType
  status: InvoiceStatus
  title: string
  issueDate: string
  dueDate: string
  clientName: string
  clientAddress: string
  clientEmail: string
  lineItems: Array<{
    description: string
    amount: number
    type: InvoiceLineItemType
  }>
  payment: {
    bankName: string
    accountNumber: string
    accountName: string
  }
  signatureName: string
  signatureTitle: string
  notes: string
  vatEnabled: boolean
}

type InvoiceFormProps = {
  mode?: "create" | "edit"
  invoiceId?: string
  initialValues?: InvoiceFormInitialValues
}

const documentTypeOptions = [
  { value: "invoice", label: "Invoice" },
  { value: "quote", label: "Quote" },
]

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
]

const lineItemTypeOptions = [
  { value: "service", label: "Service" },
  { value: "discount", label: "Discount" },
  { value: "adjustment", label: "Adjustment" },
]

function createEmptyLineItem(): LineItemDraft {
  return {
    key: crypto.randomUUID(),
    description: "",
    amount: "",
    type: "service",
  }
}

const todayISO = new Date().toISOString().slice(0, 10)

export function InvoiceForm({
  mode = "create",
  invoiceId,
  initialValues,
}: InvoiceFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [invoiceNumber, setInvoiceNumber] = useState(
    initialValues?.invoiceNumber ?? ""
  )
  const [documentType, setDocumentType] = useState<InvoiceDocumentType>(
    initialValues?.documentType ?? "invoice"
  )
  const [status, setStatus] = useState<InvoiceStatus>(
    initialValues?.status ?? "draft"
  )
  const [title, setTitle] = useState(initialValues?.title ?? "")
  const [issueDate, setIssueDate] = useState(
    initialValues?.issueDate ?? todayISO
  )
  const [dueDate, setDueDate] = useState(initialValues?.dueDate ?? "")
  const [clientName, setClientName] = useState(initialValues?.clientName ?? "")
  const [clientAddress, setClientAddress] = useState(
    initialValues?.clientAddress ?? ""
  )
  const [clientEmail, setClientEmail] = useState(
    initialValues?.clientEmail ?? ""
  )
  const [lineItems, setLineItems] = useState<LineItemDraft[]>(() => {
    if (initialValues?.lineItems?.length) {
      return initialValues.lineItems.map((item) => ({
        key: crypto.randomUUID(),
        description: item.description,
        amount: formatAmountFromNumber(Math.abs(item.amount)),
        type: item.type,
      }))
    }
    return [createEmptyLineItem()]
  })
  const [payment, setPayment] = useState(
    initialValues?.payment ?? invoicePaymentDefaults
  )
  const [signatureName, setSignatureName] = useState(
    initialValues?.signatureName ?? invoiceSignatureDefaults.name
  )
  const [signatureTitle, setSignatureTitle] = useState(
    initialValues?.signatureTitle ?? invoiceSignatureDefaults.title
  )
  const [notes, setNotes] = useState(initialValues?.notes ?? "")
  const [vatEnabled, setVatEnabled] = useState(
    initialValues?.vatEnabled ?? false
  )

  const totals = useMemo(() => {
    return calculateInvoiceTotals(
      lineItems
        .filter((item) => item.description.trim() && item.amount.trim())
        .map((item) => ({
          amount: normalizeLineItemAmount(
            item.type,
            parseAmountInput(item.amount) ?? 0
          ),
          type: item.type,
        })),
      { vatEnabled, vatRate: DEFAULT_VAT_RATE }
    )
  }, [lineItems, vatEnabled])

  const updateLineItem = (
    key: string,
    patch: Partial<Omit<LineItemDraft, "key">>
  ) => {
    setLineItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...patch } : item))
    )
  }

  const removeLineItem = (key: string) => {
    setLineItems((current) =>
      current.length > 1 ? current.filter((item) => item.key !== key) : current
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const preparedItems = lineItems
      .filter((item) => item.description.trim())
      .map((item) => ({
        description: item.description.trim(),
        amount: parseAmountInput(item.amount) ?? 0,
        type: item.type,
      }))

    if (preparedItems.length === 0) {
      const message = "Add at least one line item."
      setError(message)
      notify.error(message)
      return
    }

    if (preparedItems.some((item) => item.amount <= 0)) {
      const message = "Every line item needs an amount greater than zero."
      setError(message)
      notify.error(message)
      return
    }

    setIsSubmitting(true)

    const payload = {
      invoiceNumber: invoiceNumber.trim(),
      documentType,
      status,
      title: title.trim(),
      issueDate,
      dueDate,
      clientName: clientName.trim(),
      clientAddress: clientAddress.trim(),
      clientEmail: clientEmail.trim(),
      lineItems: preparedItems,
      payment,
      signatureName: signatureName.trim(),
      signatureTitle: signatureTitle.trim(),
      notes: notes.trim(),
      vatEnabled,
    }

    const endpoint =
      mode === "edit" && invoiceId
        ? `/api/admin/invoices/${invoiceId}`
        : "/api/admin/invoices"

    const response = await fetch(endpoint, {
      method: mode === "edit" ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const data = (await response.json().catch(() => null)) as {
      error?: string
      invoice?: { id: string }
    } | null

    setIsSubmitting(false)

    if (!response.ok) {
      const message = data?.error ?? "Unable to save invoice."
      setError(message)
      notify.error(message)
      return
    }

    notify.success(mode === "edit" ? "Invoice updated." : "Invoice created.")

    const targetId = mode === "edit" ? invoiceId : data?.invoice?.id
    router.push(targetId ? `/admin/invoices/${targetId}` : "/admin/invoices")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          Invoice details
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="invoice-title" className={labelClassName}>
              Title
            </label>
            <Input
              id="invoice-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Corporate website design & development"
              className={fieldClassName}
              required
            />
          </div>

          <div>
            <label htmlFor="invoice-number" className={labelClassName}>
              Invoice number{" "}
              {mode === "create" ? (
                <span className="font-normal text-muted-foreground">
                  (auto-generated if left empty)
                </span>
              ) : null}
            </label>
            <Input
              id="invoice-number"
              value={invoiceNumber}
              onChange={(event) => setInvoiceNumber(event.target.value)}
              placeholder="INV2026CI11"
              className={fieldClassName}
              required={mode === "edit"}
            />
          </div>

          <div>
            <label htmlFor="invoice-document-type" className={labelClassName}>
              Document type
            </label>
            <DropdownField
              id="invoice-document-type"
              options={documentTypeOptions}
              value={documentType}
              onValueChange={(value) =>
                setDocumentType((value as InvoiceDocumentType) ?? "invoice")
              }
            />
          </div>

          <div>
            <label htmlFor="invoice-status" className={labelClassName}>
              Status
            </label>
            <DropdownField
              id="invoice-status"
              options={statusOptions}
              value={status}
              onValueChange={(value) =>
                setStatus((value as InvoiceStatus) ?? "draft")
              }
            />
          </div>

          <div>
            <label htmlFor="invoice-issue-date" className={labelClassName}>
              Issue date
            </label>
            <Input
              id="invoice-issue-date"
              type="date"
              value={issueDate}
              onChange={(event) => setIssueDate(event.target.value)}
              className={fieldClassName}
              required
            />
          </div>

          <div>
            <label htmlFor="invoice-due-date" className={labelClassName}>
              Due date{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <Input
              id="invoice-due-date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className={fieldClassName}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          Client
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="invoice-client-name" className={labelClassName}>
              Client name
            </label>
            <Input
              id="invoice-client-name"
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
              placeholder="Chuka Igboegwu"
              className={fieldClassName}
              required
            />
          </div>

          <div>
            <label htmlFor="invoice-client-email" className={labelClassName}>
              Client email{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <Input
              id="invoice-client-email"
              type="email"
              value={clientEmail}
              onChange={(event) => setClientEmail(event.target.value)}
              placeholder="client@example.com"
              className={fieldClassName}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="invoice-client-address" className={labelClassName}>
              Client address{" "}
              <span className="font-normal text-muted-foreground">
                (one line per row)
              </span>
            </label>
            <textarea
              id="invoice-client-address"
              value={clientAddress}
              onChange={(event) => setClientAddress(event.target.value)}
              placeholder={"Unmask NG\nLagos, Nigeria"}
              rows={3}
              className={textareaClassName}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Line items
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-lg"
            onClick={() =>
              setLineItems((current) => [...current, createEmptyLineItem()])
            }
          >
            <Plus className="size-4" aria-hidden />
            Add item
          </Button>
        </div>

        <div className="space-y-3">
          {lineItems.map((item) => (
            <div
              key={item.key}
              className="grid gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 sm:grid-cols-[1fr_150px_150px_auto] sm:items-center"
            >
              <Input
                aria-label="Item description"
                value={item.description}
                onChange={(event) =>
                  updateLineItem(item.key, { description: event.target.value })
                }
                placeholder="Service description"
                className={fieldClassName}
              />
              <CurrencyInput
                aria-label="Item amount"
                value={item.amount}
                onValueChange={(amount) =>
                  updateLineItem(item.key, { amount })
                }
                placeholder="0.00"
                className={fieldClassName}
              />
              <DropdownField
                options={lineItemTypeOptions}
                value={item.type}
                onValueChange={(value) =>
                  updateLineItem(item.key, {
                    type: (value as InvoiceLineItemType) ?? "service",
                  })
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove line item"
                disabled={lineItems.length <= 1}
                onClick={() => removeLineItem(item.key)}
                className="justify-self-end text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </div>
          ))}
        </div>

        <label className="inline-flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
          <input
            type="checkbox"
            checked={vatEnabled}
            onChange={(event) => setVatEnabled(event.target.checked)}
            className="mt-0.5 size-4 rounded border-border text-brand focus:ring-brand/30"
          />
          <span className="text-sm leading-relaxed text-foreground">
            <span className="font-medium">Apply VAT ({DEFAULT_VAT_RATE}%)</span>
            <span className="mt-0.5 block text-muted-foreground">
              Adds {DEFAULT_VAT_RATE}% tax on the amount after discounts.
            </span>
          </span>
        </label>

        <div className="ml-auto w-full max-w-xs space-y-1.5 rounded-xl border border-border/60 bg-card p-4 text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatNaira(totals.subtotal)}</span>
          </div>
          {totals.discountTotal > 0 ? (
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Discount</span>
              <span className="tabular-nums">
                -{formatNaira(totals.discountTotal)}
              </span>
            </div>
          ) : null}
          {vatEnabled ? (
            <div className="flex items-center justify-between text-muted-foreground">
              <span>VAT ({DEFAULT_VAT_RATE}%)</span>
              <span className="tabular-nums">{formatNaira(totals.vatAmount)}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between border-t border-border/60 pt-2 font-bold text-foreground">
            <span>Total</span>
            <span className="tabular-nums">{formatNaira(totals.total)}</span>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          Payment method
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="invoice-bank-name" className={labelClassName}>
              Bank name
            </label>
            <Input
              id="invoice-bank-name"
              value={payment.bankName}
              onChange={(event) =>
                setPayment((current) => ({
                  ...current,
                  bankName: event.target.value,
                }))
              }
              className={fieldClassName}
              required
            />
          </div>
          <div>
            <label htmlFor="invoice-account-number" className={labelClassName}>
              Account number
            </label>
            <Input
              id="invoice-account-number"
              value={payment.accountNumber}
              onChange={(event) =>
                setPayment((current) => ({
                  ...current,
                  accountNumber: event.target.value,
                }))
              }
              className={fieldClassName}
              required
            />
          </div>
          <div>
            <label htmlFor="invoice-account-name" className={labelClassName}>
              Account name
            </label>
            <Input
              id="invoice-account-name"
              value={payment.accountName}
              onChange={(event) =>
                setPayment((current) => ({
                  ...current,
                  accountName: event.target.value,
                }))
              }
              className={fieldClassName}
              required
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          Signature & notes
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="invoice-signature-name" className={labelClassName}>
              Signature name
            </label>
            <Input
              id="invoice-signature-name"
              value={signatureName}
              onChange={(event) => setSignatureName(event.target.value)}
              className={fieldClassName}
            />
          </div>
          <div>
            <label htmlFor="invoice-signature-title" className={labelClassName}>
              Signature title
            </label>
            <Input
              id="invoice-signature-title"
              value={signatureTitle}
              onChange={(event) => setSignatureTitle(event.target.value)}
              className={fieldClassName}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="invoice-notes" className={labelClassName}>
              Additional notes{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <textarea
              id="invoice-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="50% of the total amount should be paid before the project commences."
              rows={3}
              className={textareaClassName}
            />
          </div>
        </div>
      </section>

      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-6 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl px-5"
          disabled={isSubmitting}
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "h-11 rounded-xl bg-brand px-6 text-brand-foreground hover:bg-brand/90",
            isSubmitting && "opacity-70"
          )}
        >
          {isSubmitting
            ? "Saving…"
            : mode === "edit"
              ? "Save changes"
              : "Create invoice"}
        </Button>
      </div>
    </form>
  )
}
