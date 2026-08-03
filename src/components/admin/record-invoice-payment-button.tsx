"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Banknote } from "lucide-react"

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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_PURPOSE_LABELS,
  PAYMENT_STATUS_LABELS,
  type PaymentMethod,
  type PaymentPurpose,
  type PaymentStatus,
} from "@/lib/crm/payment-types"
import { formatNaira } from "@/lib/invoices/formatting"
import { formatAmountFromNumber, parseAmountInput } from "@/lib/money"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

const fieldClassName =
  "h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
const labelClassName = "mb-1.5 block text-xs font-medium text-foreground"
const textareaClassName = cn(
  fieldClassName,
  "min-h-[88px] resize-y py-2.5 leading-relaxed"
)

type RecordInvoicePaymentButtonProps = {
  invoiceId: string
  invoiceNumber: string
  clientId: string | null
  clientName: string
  balance: number
  disabled?: boolean
}

export function RecordInvoicePaymentButton({
  invoiceId,
  invoiceNumber,
  clientId,
  clientName,
  balance,
  disabled = false,
}: RecordInvoicePaymentButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [amount, setAmount] = useState(formatAmountFromNumber(balance))
  const [method, setMethod] = useState<PaymentMethod>("bank_transfer")
  const [status, setStatus] = useState<PaymentStatus>("completed")
  const [purpose, setPurpose] = useState<PaymentPurpose | "">("")
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10))
  const [reference, setReference] = useState("")
  const [description, setDescription] = useState("")
  const [notes, setNotes] = useState("")

  function resetForm() {
    setAmount(formatAmountFromNumber(balance))
    setMethod("bank_transfer")
    setStatus("completed")
    setPurpose("")
    setPaidAt(new Date().toISOString().slice(0, 10))
    setReference("")
    setDescription("")
    setNotes("")
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!clientId) {
      notify.error(
        "Link this invoice to a CRM client before recording a payment."
      )
      return
    }

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
      const response = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          invoiceId,
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
      } | null

      if (!response.ok) {
        notify.error(result?.error ?? "Unable to save payment.")
        return
      }

      setOpen(false)
      resetForm()
      notify.success("Payment recorded.")
      router.refresh()
    } catch {
      notify.error("Unable to save payment right now.")
    } finally {
      setSaving(false)
    }
  }

  const paymentDisabled = disabled || !clientId || balance <= 0
  const paymentTooltip = !clientId
    ? "Link a CRM client on the invoice first"
    : balance <= 0
      ? "Invoice is already fully paid"
      : "Record payment"

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-10 rounded-xl disabled:pointer-events-auto"
              aria-label={paymentTooltip}
              disabled={paymentDisabled}
              onClick={() => {
                if (paymentDisabled) return
                resetForm()
                setOpen(true)
              }}
            />
          }
        >
          <Banknote className="size-4" aria-hidden />
        </TooltipTrigger>
        <TooltipContent>{paymentTooltip}</TooltipContent>
      </Tooltip>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen) resetForm()
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record payment</DialogTitle>
            <DialogDescription>
              Log a payment for {invoiceNumber} ({clientName}). Balance due:{" "}
              {formatNaira(balance)}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClassName} htmlFor="invoice-pay-amount">
                  Amount (₦)
                </label>
                <CurrencyInput
                  id="invoice-pay-amount"
                  value={amount}
                  onValueChange={setAmount}
                  className={fieldClassName}
                  required
                />
              </div>
              <div>
                <label className={labelClassName} htmlFor="invoice-pay-date">
                  Payment date
                </label>
                <Input
                  id="invoice-pay-date"
                  type="date"
                  value={paidAt}
                  onChange={(event) => setPaidAt(event.target.value)}
                  className={fieldClassName}
                  required
                />
              </div>
              <div>
                <label className={labelClassName} htmlFor="invoice-pay-method">
                  Method
                </label>
                <select
                  id="invoice-pay-method"
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
                  ).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClassName} htmlFor="invoice-pay-status">
                  Status
                </label>
                <select
                  id="invoice-pay-status"
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
                  ).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClassName} htmlFor="invoice-pay-purpose">
                Purpose
              </label>
              <select
                id="invoice-pay-purpose"
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
                ).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className={labelClassName}
                htmlFor="invoice-pay-description"
              >
                Description
              </label>
              <textarea
                id="invoice-pay-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What this payment covers..."
                className={textareaClassName}
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="invoice-pay-ref">
                Reference
              </label>
              <Input
                id="invoice-pay-ref"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                className={fieldClassName}
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="invoice-pay-notes">
                Notes
              </label>
              <textarea
                id="invoice-pay-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className={textareaClassName}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
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
    </>
  )
}
