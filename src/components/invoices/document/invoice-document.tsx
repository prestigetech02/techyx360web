import {
  InvoiceHeader,
  type InvoiceDocumentType,
  type InvoiceIssuer,
} from "@/components/invoices/document/invoice-header"
import {
  InvoiceTable,
  type InvoiceLineItem,
} from "@/components/invoices/document/invoice-table"
import {
  InvoiceFooter,
  type InvoicePaymentDetails,
} from "@/components/invoices/document/invoice-footer"
import { InvoiceCompanyBar } from "@/components/invoices/document/invoice-company-bar"
import { InvoiceTopBar } from "@/components/invoices/document/invoice-top-bar"
import { formatInvoiceDate } from "@/lib/invoices/formatting"
import { cn } from "@/lib/utils"

export type InvoiceDocumentProps = {
  issuer: InvoiceIssuer
  invoiceNumber: string
  documentType: InvoiceDocumentType
  issueDate: string
  title: string
  clientName: string
  clientAddressLines: string[]
  lineItems: InvoiceLineItem[]
  subtotal?: number
  discountTotal?: number
  vatEnabled?: boolean
  vatRate?: number
  vatAmount?: number
  total: number
  notes?: string
  payment: InvoicePaymentDetails
  signatureName?: string
  signatureTitle?: string
  className?: string
  exportMode?: boolean
  logoAbsoluteUrl?: string
  watermarkAbsoluteUrl?: string
}

export function InvoiceDocument({
  issuer,
  invoiceNumber,
  documentType,
  issueDate,
  title,
  clientName,
  clientAddressLines,
  lineItems,
  subtotal,
  discountTotal,
  vatEnabled,
  vatRate,
  vatAmount,
  total,
  notes,
  payment,
  signatureName,
  signatureTitle,
  className,
  exportMode = false,
  logoAbsoluteUrl,
  watermarkAbsoluteUrl,
}: InvoiceDocumentProps) {
  const watermarkSrc =
    watermarkAbsoluteUrl ?? logoAbsoluteUrl ?? "/techyx360-logo-black.webp"

  return (
    <article className={cn("invoice-document", className)}>
      <div className="invoice-document__watermark" aria-hidden>
        {exportMode ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={watermarkSrc} alt="" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/techyx360-logo-black.webp" alt="" />
        )}
      </div>

      <InvoiceTopBar />

      <div className="invoice-document__content">
        <InvoiceHeader
          issuer={issuer}
          invoiceNumber={invoiceNumber}
          issueDate={formatInvoiceDate(issueDate)}
          documentType={documentType}
          clientName={clientName}
          clientAddressLines={clientAddressLines}
          title={title}
          exportMode={exportMode}
          logoAbsoluteUrl={logoAbsoluteUrl}
        />

        <InvoiceTable
          lineItems={lineItems}
          subtotal={subtotal}
          discountTotal={discountTotal}
          vatEnabled={vatEnabled}
          vatRate={vatRate}
          vatAmount={vatAmount}
          total={total}
        />

        <InvoiceFooter
          notes={notes}
          payment={payment}
          signatureName={signatureName}
          signatureTitle={signatureTitle}
        />
      </div>

      <InvoiceCompanyBar issuer={issuer} />
    </article>
  )
}
