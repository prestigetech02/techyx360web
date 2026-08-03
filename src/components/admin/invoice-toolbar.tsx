"use client"

import Link from "next/link"
import { Pencil } from "lucide-react"

import { InvoiceActions } from "@/components/admin/invoice-actions"
import { RecordInvoicePaymentButton } from "@/components/admin/record-invoice-payment-button"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type InvoiceToolbarProps = {
  invoiceId: string
  invoiceNumber: string
  clientId: string | null
  clientName: string
  clientEmail: string | null
  balance: number
  cancelled: boolean
  emailConfigured: boolean
}

export function InvoiceToolbar({
  invoiceId,
  invoiceNumber,
  clientId,
  clientName,
  clientEmail,
  balance,
  cancelled,
  emailConfigured,
}: InvoiceToolbarProps) {
  return (
    <TooltipProvider>
      <div className="flex shrink-0 items-center justify-end gap-1.5 self-end sm:self-start">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                className="size-10 rounded-xl"
                aria-label="Edit invoice"
                render={<Link href={`/admin/invoices/${invoiceId}/edit`} />}
              />
            }
          >
            <Pencil className="size-4" aria-hidden />
          </TooltipTrigger>
          <TooltipContent>Edit</TooltipContent>
        </Tooltip>

        <RecordInvoicePaymentButton
          invoiceId={invoiceId}
          invoiceNumber={invoiceNumber}
          clientId={clientId}
          clientName={clientName}
          balance={balance}
          disabled={cancelled}
        />

        <InvoiceActions
          invoiceId={invoiceId}
          invoiceNumber={invoiceNumber}
          clientEmail={clientEmail}
          emailConfigured={emailConfigured}
        />
      </div>
    </TooltipProvider>
  )
}
