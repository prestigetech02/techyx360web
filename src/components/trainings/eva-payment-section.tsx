"use client"

import { useState } from "react"
import { Upload } from "lucide-react"

import { evaPaymentDetails } from "@/config/executive-virtual-assistance"
import { cn } from "@/lib/utils"

const labelClassName = "mb-2 block text-sm font-medium text-foreground"

type EvaPaymentSectionProps = {
  disabled?: boolean
}

export function EvaPaymentSection({ disabled = false }: EvaPaymentSectionProps) {
  const [fileName, setFileName] = useState<string | null>(null)

  return (
    <div className="space-y-4 rounded-2xl border border-border/60 bg-muted/20 p-5 sm:p-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-brand uppercase">
          Course Payment
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {evaPaymentDetails.paymentNote}
        </p>
      </div>

      <div className="rounded-xl border border-brand/20 bg-brand/5 p-4">
        <p className="text-xs font-semibold tracking-wide text-brand uppercase">
          Pay {evaPaymentDetails.amount}
        </p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
            <dt className="text-muted-foreground">Bank</dt>
            <dd className="font-medium text-foreground">
              {evaPaymentDetails.bankName}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
            <dt className="text-muted-foreground">Account number</dt>
            <dd className="font-medium text-foreground">
              {evaPaymentDetails.accountNumber}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
            <dt className="text-muted-foreground">Account name</dt>
            <dd className="font-medium text-foreground">
              {evaPaymentDetails.accountName}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <label htmlFor="register-paymentReceipt" className={labelClassName}>
          Upload payment receipt
        </label>
        <p className="mb-3 text-sm text-muted-foreground">
          Upload a screenshot or PDF of your transfer confirmation (JPG, PNG,
          WebP, or PDF, max 5 MB).
        </p>

        <label
          className={cn(
            "flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-background px-4 py-6 text-center transition-colors hover:border-brand/40 hover:bg-brand/5",
            disabled && "cursor-not-allowed opacity-60"
          )}
        >
          <Upload className="size-5 text-brand" aria-hidden />
          <span className="text-sm font-medium text-foreground">
            {fileName ?? "Choose receipt file"}
          </span>
          <span className="text-xs text-muted-foreground">
            Click to browse your device
          </span>
          <input
            id="register-paymentReceipt"
            name="paymentReceipt"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            required
            disabled={disabled}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0]
              setFileName(file?.name ?? null)
            }}
          />
        </label>
      </div>
    </div>
  )
}
