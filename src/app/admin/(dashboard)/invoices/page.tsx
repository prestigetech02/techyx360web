import Link from "next/link"
import { Plus } from "lucide-react"

import { InvoicesDashboard } from "@/components/admin/invoices-dashboard"
import { Button } from "@/components/ui/button"
import { brand } from "@/config/brand"
import { getAdminInvoices } from "@/lib/invoices/queries"
import { isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Invoices | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminInvoicesPage() {
  const invoices = await getAdminInvoices()

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            Billing
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Invoices
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Create, send, and track invoices for clients and training
            programmes.
          </p>
        </div>

        <Button
          render={<Link href="/admin/invoices/new" />}
          className="h-11 shrink-0 gap-2 rounded-xl bg-brand px-5 text-brand-foreground hover:bg-brand/90"
        >
          <Plus className="size-4" aria-hidden />
          Create invoice
        </Button>
      </div>

      {!isSupabaseConfigured() ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
          Invoices require Supabase. Add your env keys and run the
          `supabase/invoices.sql` migration to enable invoicing.
        </div>
      ) : null}

      <InvoicesDashboard invoices={invoices} />
    </div>
  )
}
