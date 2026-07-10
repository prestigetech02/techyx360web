import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { InvoiceForm } from "@/components/admin/invoice-form"
import { Button } from "@/components/ui/button"
import { brand } from "@/config/brand"
import { isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Create Invoice | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminInvoiceNewPage() {
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
          <InvoiceForm mode="create" />
        </div>
      )}
    </div>
  )
}
