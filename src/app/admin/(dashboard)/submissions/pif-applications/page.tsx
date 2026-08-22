import { PifApplicationsDashboard } from "@/components/admin/pif-applications-dashboard"
import { brand } from "@/config/brand"
import { getPifApplicationsPageData } from "@/lib/admin/pif-applications"
import { isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `PIF Applications | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

type AdminPifApplicationsPageProps = {
  searchParams?: Promise<{ page?: string; status?: string }>
}

export default async function AdminPifApplicationsPage({
  searchParams,
}: AdminPifApplicationsPageProps) {
  const params = (await searchParams) ?? {}

  if (!isSupabaseConfigured()) {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            Submissions
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            PIF Application
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Review Product Innovation Fellowship applications and follow up with
            applicants.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Supabase is not configured yet. Add your env keys to view PIF
            applications.
          </p>
        </div>
      </div>
    )
  }

  let loadError: string | null = null
  let pageData: Awaited<ReturnType<typeof getPifApplicationsPageData>> | null =
    null

  try {
    pageData = await getPifApplicationsPageData({
      page: params.page,
      status: params.status,
    })
  } catch {
    loadError =
      "Could not load PIF applications. Make sure you have run supabase/pif-applications.sql and supabase/pif-applications-payment-receipt-migration.sql in Supabase."
  }

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
          Submissions
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          PIF Application
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Review Product Innovation Fellowship applications and follow up with
          applicants.
        </p>
      </div>

      {loadError || !pageData ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {loadError}
        </div>
      ) : (
        <PifApplicationsDashboard
          applications={pageData.applications}
          stats={pageData.stats}
          pagination={pageData.pagination}
          statusFilter={pageData.statusFilter}
          pathname="/admin/submissions/pif-applications"
          query={
            pageData.statusFilter !== "all"
              ? { status: pageData.statusFilter }
              : undefined
          }
        />
      )}
    </div>
  )
}
