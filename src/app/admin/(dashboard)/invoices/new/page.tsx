import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { InvoiceForm } from "@/components/admin/invoice-form"
import { Button } from "@/components/ui/button"
import { brand } from "@/config/brand"
import {
  invoicePaymentDefaults,
  invoiceSignatureDefaults,
} from "@/config/invoice-defaults"
import { isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Create Invoice | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

type AdminInvoiceNewPageProps = {
  searchParams: Promise<{
    clientName?: string
    clientEmail?: string
    description?: string
    amount?: string
  }>
}

export default async function AdminInvoiceNewPage({
  searchParams,
}: AdminInvoiceNewPageProps) {
  const params = await searchParams
  const clientName = params.clientName?.trim() || ""
  const clientEmail = params.clientEmail?.trim() || ""
  const description = params.description?.trim() || ""
  const amountValue = Number(params.amount)
  const hasPrefill =
    Boolean(clientName) ||
    Boolean(clientEmail) ||
    Boolean(description) ||
    (Number.isFinite(amountValue) && amountValue > 0)

  const initialValues = hasPrefill
    ? {
        invoiceNumber: "",
        documentType: "invoice" as const,
        status: "draft" as const,
        title: description ? "Hosting renewal" : "",
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: "",
        clientName,
        clientAddress: "",
        clientEmail,
        lineItems: [
          {
            description: description || "",
            amount:
              Number.isFinite(amountValue) && amountValue > 0 ? amountValue : 0,
            type: "service" as const,
          },
        ],
        payment: invoicePaymentDefaults,
        signatureName: invoiceSignatureDefaults.name,
        signatureTitle: invoiceSignatureDefaults.title,
        notes: "",
        vatEnabled: false,
      }
    : undefined

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          render={<Link href="/admin/invoices" />}
          aria-label="Back to invoices"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            Billing
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
            Create invoice
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fill in the client details and line items to generate an invoice.
          </p>
        </div>
      </div>

      {!isSupabaseConfigured() ? (
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
          <p className="text-sm text-muted-foreground sm:text-base">
            Supabase is not configured yet. Add your env keys and run the
            `supabase/invoices.sql` migration before creating invoices.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
          <InvoiceForm mode="create" initialValues={initialValues} />
        </div>
      )}
    </div>
  )
}
