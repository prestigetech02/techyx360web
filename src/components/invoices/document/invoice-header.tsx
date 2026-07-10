import Image from "next/image"

import { cn } from "@/lib/utils"

export type InvoiceIssuer = {
  legalName: string
  rcNumber?: string
  logoUrl?: string
  addressLines: string[]
  website?: string
  email?: string
  phone?: string
}

export type InvoiceDocumentType = "invoice" | "quote"

export type InvoiceHeaderProps = {
  issuer: InvoiceIssuer
  invoiceNumber: string
  issueDate: string
  documentType: InvoiceDocumentType
  clientName: string
  clientAddressLines: string[]
  title: string
  className?: string
  exportMode?: boolean
  logoAbsoluteUrl?: string
}

const documentTypeLabels: Record<InvoiceDocumentType, string> = {
  invoice: "INVOICE",
  quote: "QUOTE",
}

export function InvoiceHeader({
  issuer,
  invoiceNumber,
  issueDate,
  documentType,
  clientName,
  clientAddressLines,
  title,
  className,
  exportMode = false,
  logoAbsoluteUrl,
}: InvoiceHeaderProps) {
  const logoSrc = logoAbsoluteUrl ?? issuer.logoUrl ?? "/techyx360-logo-black.webp"
  const rcLabel = issuer.rcNumber
    ? `RC${issuer.rcNumber.replace(/^RC/i, "")}`
    : null

  return (
    <header className={cn("invoice-document__header", className)}>
      <div className="invoice-document__header-brand-row">
        <div className="invoice-document__header-brand">
          {rcLabel ? (
            <p className="invoice-document__issuer-rc">{rcLabel}</p>
          ) : null}
          {exportMode ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoSrc}
              alt="Techyx360"
              className="invoice-document__logo"
            />
          ) : (
            <div className="invoice-document__logo-wrap">
              <Image
                src={issuer.logoUrl ?? "/techyx360-logo-black.webp"}
                alt="Techyx360"
                fill
                className="invoice-document__logo object-contain object-left"
                sizes="240px"
                priority
              />
            </div>
          )}
        </div>
        <p className="invoice-document__header-date">{issueDate}</p>
      </div>

      <div className="invoice-document__header-divider" aria-hidden />

      <div className="invoice-document__header-details-row">
        <div className="invoice-document__header-recipient">
          <p className="invoice-document__label">Invoice to</p>
          <p className="invoice-document__client-name">{clientName}</p>
          {clientAddressLines.map((line, index) => (
            <p key={`${line}-${index}`} className="invoice-document__client-line">
              {line}
            </p>
          ))}
        </div>

        <div className="invoice-document__header-doc-meta">
          <p className="invoice-document__invoice-number">{invoiceNumber}</p>
          <p className="invoice-document__document-type">
            {documentTypeLabels[documentType]}
          </p>
        </div>
      </div>

      {title ? (
        <p className="invoice-document__title">{title}</p>
      ) : null}
    </header>
  )
}
