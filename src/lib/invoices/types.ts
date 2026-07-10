import type { Database } from "@/types/database"

export type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"]
export type InvoiceLineItemRow =
  Database["public"]["Tables"]["invoice_line_items"]["Row"]

export type InvoiceDocumentType = "invoice" | "quote"
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled"
export type InvoiceLineItemType = "service" | "discount" | "tax" | "adjustment"

export const INVOICE_STATUSES: InvoiceStatus[] = [
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled",
]

export const INVOICE_DOCUMENT_TYPES: InvoiceDocumentType[] = [
  "invoice",
  "quote",
]

export type InvoiceWithItems = InvoiceRow & {
  line_items: InvoiceLineItemRow[]
}

export type InvoiceLineItemInput = {
  description: string
  amount: number
  type: InvoiceLineItemType
}

export type InvoiceFormValues = {
  documentType: InvoiceDocumentType
  status: InvoiceStatus
  title: string
  issueDate: string
  dueDate?: string
  clientName: string
  clientAddress: string
  clientEmail?: string
  lineItems: InvoiceLineItemInput[]
  payment: {
    bankName: string
    accountNumber: string
    accountName: string
  }
  signatureName?: string
  signatureTitle?: string
  notes?: string
}
