import { FinanceReportsDashboard } from "@/components/admin/finance-reports-dashboard"
import { brand } from "@/config/brand"
import { getFinanceReconciliation } from "@/lib/admin/finance-reconciliation"
import {
  getFinancePerformanceReport,
  getFinancePnLReport,
  parseFinanceReportTab,
} from "@/lib/admin/finance-reports"
import { getAllClients } from "@/lib/crm/clients"
import { isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Reports | Finance | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

type AdminReportsPageProps = {
  searchParams?: Promise<{
    tab?: string
    from?: string
    to?: string
    purpose?: string
    category?: string
    client?: string
    year?: string
    month?: string
  }>
}

export default async function AdminReportsPage({
  searchParams,
}: AdminReportsPageProps) {
  const params = (await searchParams) ?? {}
  const tab = parseFinanceReportTab(params.tab)

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-w-0 space-y-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            Finance
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Reports
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Supabase is not configured yet. Add your env keys to view profit and
            loss reports.
          </p>
        </div>
      </div>
    )
  }

  try {
    const [report, performance, reconciliation, clients] = await Promise.all([
      getFinancePnLReport({
        from: params.from,
        to: params.to,
        purpose: params.purpose,
        category: params.category,
        clientId: params.client,
      }),
      getFinancePerformanceReport({
        year: params.year,
      }),
      getFinanceReconciliation({
        year: params.year,
        month: params.month,
      }),
      getAllClients().catch(() => []),
    ])

    return (
      <FinanceReportsDashboard
        tab={tab}
        report={report}
        performance={performance}
        reconciliation={reconciliation}
        clients={clients.map((client) => ({
          id: client.id,
          company: client.company,
        }))}
      />
    )
  } catch {
    return (
      <div className="min-w-0 space-y-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            Finance
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Reports
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            View profit and loss from payments and expenses.
          </p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          Could not load finance reports. Make sure payments and expenses tables
          exist in Supabase. For reconciliation, also run{" "}
          <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs dark:bg-red-950/50">
            supabase/finance-reconciliations.sql
          </code>
          .
        </div>
      </div>
    )
  }
}
