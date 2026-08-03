import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { InvoiceToolbar } from "@/components/admin/invoice-toolbar"
import { InvoiceDocument } from "@/components/invoices/document/invoice-document"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { brand } from "@/config/brand"
import { invoiceIssuerDefaults } from "@/config/invoice-defaults"
import { isInvoiceEmailConfigured } from "@/lib/invoices/email-config"
import { mapInvoiceToDocumentProps } from "@/lib/invoices/mappers"
import { getInvoiceBalance } from "@/lib/invoices/payment-link"
import { getInvoiceById } from "@/lib/invoices/queries"

export const metadata = {
  title: `Invoice | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function AdminInvoiceViewPage({ params }: PageProps) {
  const { id } = await params
  const invoice = await getInvoiceById(id)

  if (!invoice) {
    notFound()
  }

  const documentProps = mapInvoiceToDocumentProps(invoice)
  const balance = await getInvoiceBalance(invoice.id, Number(invoice.total))

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="size-10 shrink-0 rounded-xl"
            render={<Link href="/admin/invoices" />}
            aria-label="Back to invoices"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
              Billing
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {invoice.invoice_number}
              </h1>
              <Badge className="font-semibold uppercase">
                {invoice.status}
              </Badge>
            </div>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {invoice.client_name} · {invoice.title}
            </p>
          </div>
        </div>

        <InvoiceToolbar
          invoiceId={invoice.id}
          invoiceNumber={invoice.invoice_number}
          clientId={invoice.client_id}
          clientName={invoice.client_name}
          clientEmail={invoice.client_email}
          balance={balance}
          cancelled={invoice.status === "cancelled"}
          emailConfigured={isInvoiceEmailConfigured()}
        />
      </div>

      <div className="invoice-print-area flex justify-center rounded-2xl bg-muted/30 p-4 sm:p-8">
        <InvoiceDocument issuer={invoiceIssuerDefaults} {...documentProps} />
      </div>
    </div>
  )
}
