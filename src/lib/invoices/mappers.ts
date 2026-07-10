import type { InvoiceLineItem } from "@/components/invoices/document/invoice-table"
import { splitAddressLines } from "@/lib/invoices/formatting"
import type {
  InvoiceDocumentType,
  InvoiceLineItemType,
  InvoiceStatus,
  InvoiceWithItems,
} from "@/lib/invoices/types"

export function asDocumentType(value: string): InvoiceDocumentType {
  return value === "quote" ? "quote" : "invoice"
}

export function asInvoiceStatus(value: string): InvoiceStatus {
  const statuses: InvoiceStatus[] = [
    "draft",
    "sent",
    "paid",
    "overdue",
    "cancelled",
  ]
  return statuses.includes(value as InvoiceStatus)
    ? (value as InvoiceStatus)
    : "draft"
}

export function asLineItemType(value: string): InvoiceLineItemType {
  const types: InvoiceLineItemType[] = [
    "service",
    "discount",
    "tax",
    "adjustment",
  ]
  return types.includes(value as InvoiceLineItemType)
    ? (value as InvoiceLineItemType)
    : "service"
}

export function mapInvoiceToDocumentProps(invoice: InvoiceWithItems) {
  const lineItems: InvoiceLineItem[] = [...invoice.line_items]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => ({
      id: item.id,
      description: item.description,
      amount: Number(item.amount),
      type: asLineItemType(item.item_type),
    }))

  return {
    invoiceNumber: invoice.invoice_number,
    documentType: asDocumentType(invoice.document_type),
    issueDate: invoice.issue_date,
    title: invoice.title,
    clientName: invoice.client_name,
    clientAddressLines: splitAddressLines(invoice.client_address),
    lineItems,
    subtotal: Number(invoice.subtotal),
    discountTotal: Number(invoice.discount_total),
    vatEnabled: invoice.vat_enabled ?? false,
    vatRate: Number(invoice.vat_rate ?? 7.5),
    vatAmount: Number(invoice.vat_amount ?? 0),
    total: Number(invoice.total),
    notes: invoice.notes ?? undefined,
    payment: {
      bankName: invoice.payment_bank_name,
      accountNumber: invoice.payment_account_number,
      accountName: invoice.payment_account_name,
    },
    signatureName: invoice.signature_name ?? undefined,
    signatureTitle: invoice.signature_title ?? undefined,
  }
}
