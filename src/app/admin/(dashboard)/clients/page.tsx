import { ClientsDashboard } from "@/components/admin/clients-dashboard"
import { brand } from "@/config/brand"
import { getClientsPageData } from "@/lib/admin/clients-page"
import { getClientById } from "@/lib/crm/clients"
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
  searchParams?: Promise<{
    client?: string
    page?: string
    status?: string
    q?: string
    industry?: string
    companySize?: string
    location?: string
  }>
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
    const [pageData, dealStats, paymentStats] = await Promise.all([
      getClientsPageData({
        page: params.page,
        status: params.status,
        q: params.q,
        industry: params.industry,
        companySize: params.companySize,
        location: params.location,
      }),
      getDealStats().catch(() => ({ totalDeals: 0, wonValue: 0 })),
      getPaymentStats().catch(() => ({
        totalPayments: 0,
        received: 0,
        pendingCount: 0,
        pendingAmount: 0,
      })),
    ])

    let fallbackClient = null
    if (
      initialClientId &&
      !pageData.clients.some((client) => client.id === initialClientId)
    ) {
      fallbackClient = await getClientById(initialClientId)
    }

    const listQuery = {
      ...(pageData.statusFilter !== "all"
        ? { status: pageData.statusFilter }
        : {}),
      ...(pageData.listFilters.q ? { q: pageData.listFilters.q } : {}),
      ...(pageData.listFilters.industry
        ? { industry: pageData.listFilters.industry }
        : {}),
      ...(pageData.listFilters.companySize
        ? { companySize: pageData.listFilters.companySize }
        : {}),
      ...(pageData.listFilters.location
        ? { location: pageData.listFilters.location }
        : {}),
    }

    return (
      <ClientsDashboard
        clients={pageData.clients}
        initialClientId={initialClientId}
        fallbackClient={fallbackClient}
        stats={pageData.stats}
        pagination={pageData.pagination}
        statusFilter={pageData.statusFilter}
        listFilters={pageData.listFilters}
        filterOptions={pageData.filterOptions}
        pathname="/admin/clients"
        query={Object.keys(listQuery).length > 0 ? listQuery : undefined}
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

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          Could not load clients. Make sure you have run the CRM client migrations
          in Supabase.
        </div>
      </div>
    )
  }
}
