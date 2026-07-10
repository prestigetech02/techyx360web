import {
  PaymentMethod,
  type PaymentMethodDetails,
} from "@/components/invoices/document/payment-method"
import { Signature } from "@/components/invoices/document/signature"
import { cn } from "@/lib/utils"

export type InvoicePaymentDetails = PaymentMethodDetails

export type InvoiceFooterProps = {
  notes?: string
  payment: InvoicePaymentDetails
  signatureName?: string
  signatureTitle?: string
  className?: string
}

export function InvoiceFooter({
  notes,
  payment,
  signatureName,
  signatureTitle = "Techyx360 Team",
  className,
}: InvoiceFooterProps) {
  return (
    <footer className={cn("invoice-document__footer", className)}>
      {notes ? (
        <div className="invoice-document__notes">
          <p className="invoice-document__notes-label">Additional notes</p>
          <p className="invoice-document__notes-body">{notes}</p>
        </div>
      ) : null}

      <div className="invoice-document__footer-grid">
        <PaymentMethod payment={payment} />
        <Signature name={signatureName} title={signatureTitle} />
      </div>
    </footer>
  )
}
