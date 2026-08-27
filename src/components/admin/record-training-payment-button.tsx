"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Banknote, CheckCircle2 } from "lucide-react"

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
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
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
  "min-h-[72px] resize-y py-2.5 leading-relaxed"
)

type RecordTrainingPaymentButtonProps = {
  source: "course_registration" | "pif_application"
  sourceId: string
  personName: string
  programLabel: string
  purposeLabel: string
  defaultAmount: number
  financePaymentId: string | null
  hasReceipt: boolean
  className?: string
  onRecorded?: (paymentId: string) => void
}

export function RecordTrainingPaymentButton({
  source,
  sourceId,
  personName,
  programLabel,
  purposeLabel,
  defaultAmount,
  financePaymentId,
  hasReceipt,
  className,
  onRecorded,
}: RecordTrainingPaymentButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [amount, setAmount] = useState(formatAmountFromNumber(defaultAmount))
  const [method, setMethod] = useState<PaymentMethod>("bank_transfer")
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10))
  const [reference, setReference] = useState(personName)
  const [notes, setNotes] = useState("")

  if (!hasReceipt && !financePaymentId) {
    return null
  }

  if (financePaymentId) {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        <Badge className="gap-1.5 bg-emerald-500/10 font-semibold text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-3.5" aria-hidden />
          Recorded in finance
        </Badge>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl"
          render={<Link href="/admin/payments" />}
        >
          View payments
        </Button>
      </div>
    )
  }

  function resetForm() {
    setAmount(formatAmountFromNumber(defaultAmount))
    setMethod("bank_transfer")
    setPaidAt(new Date().toISOString().slice(0, 10))
    setReference(personName)
    setNotes("")
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const parsedAmount = parseAmountInput(amount)
    if (!paidAt) {
      notify.error("Payment date is required.")
      return
    }
    if (parsedAmount === null || parsedAmount <= 0) {
      notify.error("Enter a valid payment amount.")
      return
    }

    const endpoint =
      source === "course_registration"
        ? `/api/admin/course-registrations/${sourceId}/record-payment`
        : `/api/admin/pif-applications/${sourceId}/record-payment`

    setSaving(true)
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedAmount,
          method,
          paidAt,
          reference,
          notes,
        }),
      })

      const data = (await response.json().catch(() => null)) as {
        error?: string
        payment?: { id?: string }
      } | null

      if (!response.ok) {
        notify.error(data?.error ?? "Unable to record payment in finance.")
        return
      }

      notify.success("Payment recorded in finance.")
      setOpen(false)
      resetForm()
      if (data?.payment?.id) {
        onRecorded?.(data.payment.id)
      }
      router.refresh()
    } catch {
      notify.error("Unable to record payment in finance.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={cn("w-full gap-2 rounded-xl", className)}
        onClick={() => {
          resetForm()
          setOpen(true)
        }}
      >
        <Banknote className="size-4" aria-hidden />
        Record in finance
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) resetForm()
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record in finance</DialogTitle>
            <DialogDescription>
              Creates a {purposeLabel.toLowerCase()} payment for {personName} (
              {programLabel}). It will appear in Payments, Reports, and
              Reconciliation.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className={labelClassName} htmlFor="training-pay-amount">
                Amount
              </label>
              <CurrencyInput
                id="training-pay-amount"
                value={amount}
                onValueChange={setAmount}
                className={fieldClassName}
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Default fee {formatNaira(defaultAmount)}. Adjust if the student
                paid a different amount.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClassName} htmlFor="training-pay-date">
                  Payment date
                </label>
                <Input
                  id="training-pay-date"
                  type="date"
                  value={paidAt}
                  onChange={(event) => setPaidAt(event.target.value)}
                  className={fieldClassName}
                  required
                />
              </div>
              <div>
                <label className={labelClassName} htmlFor="training-pay-method">
                  Method
                </label>
                <select
                  id="training-pay-method"
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
            </div>

            <div>
              <label className={labelClassName} htmlFor="training-pay-ref">
                Reference
              </label>
              <Input
                id="training-pay-ref"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                className={fieldClassName}
                placeholder="Bank transfer reference / student name"
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="training-pay-notes">
                Notes (optional)
              </label>
              <textarea
                id="training-pay-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className={textareaClassName}
                placeholder="Any verification notes"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
              >
                {saving ? "Saving…" : "Save payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
