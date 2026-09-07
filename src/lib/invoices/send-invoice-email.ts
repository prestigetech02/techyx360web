import "server-only"

import { organization, siteUrl } from "@/config/site"
import {
  isTransactionalEmailConfigured,
  sendTransactionalEmail,
} from "@/lib/email/zeptomail"
import type { InvoiceWithItems } from "@/lib/invoices/types"

export async function sendInvoiceEmail({
  invoice,
  to,
  message,
}: {
  invoice: InvoiceWithItems
  to: string
  message?: string
}) {
  if (!isTransactionalEmailConfigured()) {
    throw new Error(
      "Email is not configured. Add ZEPTOMAIL_TOKEN and ZEPTOMAIL_FROM_EMAIL to your environment variables."
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

  await sendTransactionalEmail({
    to,
    toName: invoice.client_name || undefined,
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
        name: `${invoice.invoice_number}.pdf`,
        mimeType: "application/pdf",
        content: pdf,
      },
    ],
  })
}
