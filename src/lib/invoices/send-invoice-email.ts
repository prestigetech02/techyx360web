import "server-only"

import { Resend } from "resend"

import { organization, siteUrl } from "@/config/site"
import type { InvoiceWithItems } from "@/lib/invoices/types"

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) return null
  return new Resend(apiKey)
}

function getFromEmail() {
  return (
    process.env.INVOICE_FROM_EMAIL?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    organization.email
  )
}

export async function sendInvoiceEmail({
  invoice,
  to,
  message,
}: {
  invoice: InvoiceWithItems
  to: string
  message?: string
}) {
  const resend = getResendClient()
  if (!resend) {
    throw new Error(
      "Email is not configured. Add RESEND_API_KEY to your environment variables."
    )
  }

  const pdf = await import("@/lib/invoices/generate-invoice-pdf").then((mod) =>
    mod.generateInvoicePdf(invoice)
  )
  const subject = `${invoice.document_type === "quote" ? "Quote" : "Invoice"} ${invoice.invoice_number} from Techyx360`
  const greeting = invoice.client_name ? `Dear ${invoice.client_name},` : "Hello,"
  const bodyMessage =
    message?.trim() ||
    `Please find attached ${invoice.document_type === "quote" ? "quote" : "invoice"} ${invoice.invoice_number} for ${invoice.title}.`

  const { error } = await resend.emails.send({
    from: getFromEmail(),
    to: [to],
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f1b3d;">
        <p>${greeting}</p>
        <p>${bodyMessage}</p>
        <p>
          Total amount payable: <strong>₦${Number(invoice.total).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
        </p>
        <p>
          If you have any questions, reply to this email or contact us at
          <a href="mailto:${organization.email}">${organization.email}</a>.
        </p>
        <p>Best regards,<br />Techyx360 Team</p>
        <p style="font-size: 12px; color: #64748b;">
          <a href="${siteUrl}">${siteUrl.replace(/^https?:\/\//, "")}</a>
        </p>
      </div>
    `,
    attachments: [
      {
        filename: `${invoice.invoice_number}.pdf`,
        content: pdf,
      },
    ],
  })

  if (error) {
    throw new Error(error.message || "Unable to send invoice email.")
  }
}
