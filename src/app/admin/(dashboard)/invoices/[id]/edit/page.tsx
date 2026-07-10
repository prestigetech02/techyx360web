import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import {
  InvoiceForm,
  type InvoiceFormInitialValues,
} from "@/components/admin/invoice-form"
import { Button } from "@/components/ui/button"
import { brand } from "@/config/brand"
import {
  asDocumentType,
  asInvoiceStatus,
  asLineItemType,
} from "@/lib/invoices/mappers"
import { getInvoiceById } from "@/lib/invoices/queries"

export const metadata = {
  title: `Edit Invoice | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function AdminInvoiceEditPage({ params }: PageProps) {
  const { id } = await params
  const invoice = await getInvoiceById(id)

  if (!invoice) {
    notFound()
  }

  const initialValues: InvoiceFormInitialValues = {
    invoiceNumber: invoice.invoice_number,
    documentType: asDocumentType(invoice.document_type),
    status: asInvoiceStatus(invoice.status),
    title: invoice.title,
    issueDate: invoice.issue_date,
    dueDate: invoice.due_date ?? "",
    clientName: invoice.client_name,
    clientAddress: invoice.client_address ?? "",
    clientEmail: invoice.client_email ?? "",
    lineItems: [...invoice.line_items]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => ({
        description: item.description,
        amount: Number(item.amount),
        type: asLineItemType(item.item_type),
      })),
    payment: {
      bankName: invoice.payment_bank_name,
      accountNumber: invoice.payment_account_number,
      accountName: invoice.payment_account_name,
    },
    signatureName: invoice.signature_name ?? "",
    signatureTitle: invoice.signature_title ?? "",
    notes: invoice.notes ?? "",
    vatEnabled: invoice.vat_enabled,
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          render={<Link href={`/admin/invoices/${invoice.id}`} />}
          aria-label="Back to invoice"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            Billing
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
            Edit {invoice.invoice_number}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update the invoice details, line items, or payment information.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
        <InvoiceForm
          mode="edit"
          invoiceId={invoice.id}
          initialValues={initialValues}
        />
      </div>
    </div>
  )
}
