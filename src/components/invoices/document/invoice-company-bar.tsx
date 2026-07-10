import type { InvoiceIssuer } from "@/components/invoices/document/invoice-header"
import { cn } from "@/lib/utils"

type InvoiceCompanyBarProps = {
  issuer: InvoiceIssuer
  className?: string
}

function MapPinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="invoice-document__company-icon"
      aria-hidden
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="invoice-document__company-icon"
      aria-hidden
    >
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="invoice-document__company-icon"
      aria-hidden
    >
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1-.24c1.12.37 2.33.57 3.59.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.26.2 2.47.57 3.59a1 1 0 0 1-.24 1l-2.21 2.2z" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="invoice-document__company-icon"
      aria-hidden
    >
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm7.93 9h-3.17a15.4 15.4 0 0 0-1.2-4.32A8.03 8.03 0 0 1 19.93 11zM12 4c.95 1.57 1.63 3.36 1.95 5.25h-3.9A12.2 12.2 0 0 1 12 4zM8.27 6.68A15.4 15.4 0 0 0 7.07 11H3.9a8.03 8.03 0 0 1 4.37-4.32zM3.9 13h3.17c.26 1.54.7 3.01 1.2 4.32A8.03 8.03 0 0 1 3.9 13zm8.1 7.75A12.2 12.2 0 0 1 9.95 13h3.9c-.32 1.89-1 3.68-1.95 5.25zm2.48 0c.95-1.57 1.63-3.36 1.95-5.25h3.17a8.03 8.03 0 0 1-4.37 4.32A15.4 15.4 0 0 1 14.48 20.75zM16.73 17.32c.5-1.31.94-2.78 1.2-4.32h3.17a8.03 8.03 0 0 1-4.37 4.32z" />
    </svg>
  )
}

export function InvoiceCompanyBar({ issuer, className }: InvoiceCompanyBarProps) {
  const website = issuer.website?.replace(/^https?:\/\//, "") ?? ""
  const websiteHref = issuer.website?.startsWith("http")
    ? issuer.website
    : issuer.website
      ? `https://${issuer.website}`
      : ""

  return (
    <aside className={cn("invoice-document__company-bar", className)}>
      <div className="invoice-document__company-bar-rule" aria-hidden />

      <div className="invoice-document__company-bar-inner">
        <div className="invoice-document__company-address">
          <MapPinIcon />
          <div>
            {issuer.addressLines.map((line, index) => (
              <p key={`${line}-${index}`}>{line}</p>
            ))}
          </div>
        </div>

        <div className="invoice-document__company-contact">
          {issuer.email ? (
            <p className="invoice-document__company-contact-row">
              <MailIcon />
              <a href={`mailto:${issuer.email}`}>{issuer.email}</a>
            </p>
          ) : null}
          {issuer.phone ? (
            <p className="invoice-document__company-contact-row">
              <PhoneIcon />
              <span>{issuer.phone}</span>
            </p>
          ) : null}
          {website ? (
            <p className="invoice-document__company-contact-row">
              <GlobeIcon />
              <a href={websiteHref}>{website}</a>
            </p>
          ) : null}
        </div>
      </div>

      <div className="invoice-document__company-bar-bottom" aria-hidden>
        <div className="invoice-document__company-bar-accent" />
      </div>
    </aside>
  )
}
