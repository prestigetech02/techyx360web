import { TalentRequestsDashboard } from "@/components/admin/talent-requests-dashboard"
import { brand } from "@/config/brand"
import { getTalentRequestsPageData } from "@/lib/admin/talent-requests"
import { isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Talent Requests | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

type AdminTalentRequestsPageProps = {
  searchParams?: Promise<{ page?: string; status?: string }>
}

export default async function AdminTalentRequestsPage({
  searchParams,
}: AdminTalentRequestsPageProps) {
  const params = (await searchParams) ?? {}

  if (!isSupabaseConfigured()) {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            Recruitment
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Talent Requests
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Review outsourcing requests and follow up with companies that need
            talent.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Supabase is not configured yet. Add your env keys to view talent
            requests.
          </p>
        </div>
      </div>
    )
  }

  let loadError: string | null = null
  let pageData: Awaited<ReturnType<typeof getTalentRequestsPageData>> | null =
    null

  try {
    pageData = await getTalentRequestsPageData({
      page: params.page,
      status: params.status,
    })
  } catch {
    loadError =
      "Could not load talent requests. Make sure you have created the `talent_requests` table in Supabase."
  }

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
          Recruitment
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          Talent Requests
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Review outsourcing requests and follow up with companies that need
          talent.
        </p>
      </div>

      {loadError || !pageData ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {loadError}
        </div>
      ) : (
        <TalentRequestsDashboard
          requests={pageData.requests}
          stats={pageData.stats}
          pagination={pageData.pagination}
          statusFilter={pageData.statusFilter}
          pathname="/admin/talent-requests"
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
