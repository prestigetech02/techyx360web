import "server-only"

import type { InvoiceIssuer } from "@/components/invoices/document/invoice-header"
import { renderCompanyBarHtml } from "@/lib/invoices/render-company-bar-html"
import { renderTopBarHtml } from "@/lib/invoices/render-top-bar-html"
import { invoiceIssuerDefaults } from "@/config/invoice-defaults"
import { siteUrl } from "@/config/site"
import { formatInvoiceDate, formatNaira } from "@/lib/invoices/formatting"
import { getInvoiceDocumentStyles } from "@/lib/invoices/invoice-styles"
import { mapInvoiceToDocumentProps } from "@/lib/invoices/mappers"
import type { InvoiceWithItems } from "@/lib/invoices/types"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function resolveAssetUrl(path: string, baseUrl: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }

  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`
}

const documentTypeLabels = {
  invoice: "INVOICE",
  quote: "QUOTE",
} as const

function renderInvoiceMarkup(
  invoice: InvoiceWithItems,
  issuer: InvoiceIssuer,
  logoAbsoluteUrl: string
) {
  const props = mapInvoiceToDocumentProps(invoice)
  const issueDate = formatInvoiceDate(props.issueDate)
  const docLabel =
    documentTypeLabels[props.documentType] ?? documentTypeLabels.invoice
  const showDiscount = (props.discountTotal ?? 0) > 0
  const showVat = props.vatEnabled && (props.vatAmount ?? 0) > 0
  const showSummary = showDiscount || showVat

  const addressLines = props.clientAddressLines
    .map((line) => `<p class="invoice-document__client-line">${escapeHtml(line)}</p>`)
    .join("")

  const topBar = renderTopBarHtml()
  const companyBar = renderCompanyBarHtml(issuer)
  const rcLabel = issuer.rcNumber
    ? `RC${escapeHtml(issuer.rcNumber.replace(/^RC/i, ""))}`
    : ""

  const lineRows = props.lineItems
    .map((item) => {
      const isDiscount = item.type === "discount" || item.amount < 0
      return `<tr class="${isDiscount ? "is-discount" : ""}">
        <td>${escapeHtml(item.description)}</td>
        <td>${formatNaira(item.amount)}</td>
      </tr>`
    })
    .join("")

  const summaryRows = showSummary
    ? `
      <tr class="is-summary">
        <td>Subtotal</td>
        <td>${formatNaira(props.subtotal ?? props.total)}</td>
      </tr>
      ${
        showDiscount
          ? `<tr class="is-summary is-discount">
              <td>Discount</td>
              <td>-${formatNaira(props.discountTotal ?? 0)}</td>
            </tr>`
          : ""
      }
      ${
        showVat
          ? `<tr class="is-summary">
              <td>VAT (${props.vatRate ?? 7.5}%)</td>
              <td>${formatNaira(props.vatAmount ?? 0)}</td>
            </tr>`
          : ""
      }`
    : ""

  const notesBlock = props.notes
    ? `<div class="invoice-document__notes">
        <p class="invoice-document__notes-label">Additional notes</p>
        <p class="invoice-document__notes-body">${escapeHtml(props.notes)}</p>
      </div>`
    : ""

  const signatureBlock = props.signatureName
    ? `<div class="invoice-document__signature-line">${escapeHtml(props.signatureName)}</div>`
    : `<div class="invoice-document__signature-placeholder"></div>`

  return `<article class="invoice-document">
    <div class="invoice-document__watermark" aria-hidden="true">
      <img src="${logoAbsoluteUrl}" alt="" />
    </div>
    ${topBar}
    <div class="invoice-document__content">
      <header class="invoice-document__header">
        <div class="invoice-document__header-brand-row">
          <div class="invoice-document__header-brand">
            ${rcLabel ? `<p class="invoice-document__issuer-rc">${rcLabel}</p>` : ""}
            <img src="${logoAbsoluteUrl}" alt="Techyx360" class="invoice-document__logo" />
          </div>
          <p class="invoice-document__header-date">${escapeHtml(issueDate)}</p>
        </div>
        <div class="invoice-document__header-divider" aria-hidden="true"></div>
        <div class="invoice-document__header-details-row">
          <div class="invoice-document__header-recipient">
            <p class="invoice-document__label">Invoice to</p>
            <p class="invoice-document__client-name">${escapeHtml(props.clientName)}</p>
            ${addressLines}
          </div>
          <div class="invoice-document__header-doc-meta">
            <p class="invoice-document__invoice-number">${escapeHtml(props.invoiceNumber)}</p>
            <p class="invoice-document__document-type">${docLabel}</p>
          </div>
        </div>
        ${props.title ? `<p class="invoice-document__title">${escapeHtml(props.title)}</p>` : ""}
      </header>

      <section class="invoice-document__table-section">
        <div class="invoice-document__table-wrap">
          <table class="invoice-document__table">
            <thead>
              <tr>
                <th scope="col">Service description</th>
                <th scope="col">Amount (₦)</th>
              </tr>
            </thead>
            <tbody>${lineRows}</tbody>
            <tfoot>
              ${summaryRows}
              <tr class="is-total">
                <td>Total amount payable</td>
                <td>${formatNaira(props.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <footer class="invoice-document__footer">
        ${notesBlock}
        <div class="invoice-document__footer-grid">
          <section class="invoice-document__payment-method">
            <p class="invoice-document__payment-title">Payment method</p>
            <dl class="invoice-document__payment-rows">
              <div class="invoice-document__payment-row">
                <dt>Bank name:</dt>
                <dd>${escapeHtml(props.payment.bankName)}</dd>
              </div>
              <div class="invoice-document__payment-row">
                <dt>Bank account:</dt>
                <dd class="is-mono">${escapeHtml(props.payment.accountNumber)}</dd>
              </div>
              <div class="invoice-document__payment-row">
                <dt>Acct name:</dt>
                <dd>${escapeHtml(props.payment.accountName)}</dd>
              </div>
            </dl>
          </section>
          <section class="invoice-document__signature">
            ${signatureBlock}
            <p class="invoice-document__signature-title">${escapeHtml(props.signatureTitle ?? "Techyx360 Team")}</p>
          </section>
        </div>
      </footer>
    </div>
    ${companyBar}
  </article>`
}

export function renderInvoiceHtml(
  invoice: InvoiceWithItems,
  options?: {
    baseUrl?: string
    issuer?: InvoiceIssuer
  }
) {
  const baseUrl = options?.baseUrl ?? siteUrl
  const issuer = options?.issuer ?? invoiceIssuerDefaults
  const logoAbsoluteUrl = resolveAssetUrl(
    issuer.logoUrl ?? "/techyx360-logo-black.webp",
    baseUrl
  )
  const markup = renderInvoiceMarkup(invoice, issuer, logoAbsoluteUrl)
  const styles = getInvoiceDocumentStyles()

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(invoice.invoice_number)} — ${escapeHtml(invoice.title)}</title>
    <style>${styles}</style>
  </head>
  <body class="invoice-export-body">
    ${markup}
  </body>
</html>`
}
