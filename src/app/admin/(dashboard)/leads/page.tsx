import { LeadsDashboard } from "@/components/admin/leads-dashboard"
import { brand } from "@/config/brand"
import { getAllLeads } from "@/lib/crm/leads"
import { isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Leads | CRM | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLeadsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-w-0 space-y-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            CRM
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Leads
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage and track your potential customers.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Supabase is not configured yet. Add your env keys to view CRM leads.
          </p>
        </div>
      </div>
    )
  }

  try {
    const leads = await getAllLeads()
    return <LeadsDashboard leads={leads} />
  } catch {
    return (
      <div className="min-w-0 space-y-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            CRM
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Leads
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage and track your potential customers.
          </p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Could not load leads. Make sure you have run{" "}
          <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs">
            supabase/crm-leads.sql
          </code>{" "}
          in Supabase.
        </div>
      </div>
    )
  }
}
