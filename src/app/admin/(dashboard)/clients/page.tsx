import { ClientsDashboard } from "@/components/admin/clients-dashboard"
import { brand } from "@/config/brand"
import { getAllClients } from "@/lib/crm/clients"
import { getDealStats } from "@/lib/crm/deals"
import { getPaymentStats } from "@/lib/crm/payments"
import { isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Clients | CRM | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

type AdminClientsPageProps = {
  searchParams?: Promise<{ client?: string }>
}

export default async function AdminClientsPage({
  searchParams,
}: AdminClientsPageProps) {
  const params = (await searchParams) ?? {}
  const initialClientId =
    typeof params.client === "string" && params.client.trim()
      ? params.client.trim()
      : null

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-w-0 space-y-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            CRM
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Clients
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your clients and client relationships.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Supabase is not configured yet. Add your env keys to view CRM
            clients.
          </p>
        </div>
      </div>
    )
  }

  try {
    const [clients, dealStats, paymentStats] = await Promise.all([
      getAllClients(),
      getDealStats().catch(() => ({ totalDeals: 0, wonValue: 0 })),
      getPaymentStats().catch(() => ({
        totalPayments: 0,
        received: 0,
        pendingCount: 0,
        pendingAmount: 0,
      })),
    ])

    return (
      <ClientsDashboard
        clients={clients}
        initialClientId={initialClientId}
        totalDeals={dealStats.totalDeals}
        totalRevenue={paymentStats.received}
      />
    )
  } catch {
    return (
      <div className="min-w-0 space-y-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            CRM
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Clients
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your clients and client relationships.
          </p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Could not load clients. Make sure you have run{" "}
          <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs">
            supabase/crm-leads.sql
          </code>
          ,{" "}
          <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs">
            supabase/crm-clients.sql
          </code>
          , and{" "}
          <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs">
            supabase/crm-client-avatars.sql
          </code>{" "}
          in Supabase.
        </div>
      </div>
    )
  }
}
