import { CareerApplicationsDashboard } from "@/components/admin/career-applications-dashboard"
import { brand } from "@/config/brand"
import { getCareerApplicationsPageData } from "@/lib/admin/career-applications"
import { isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Job Applications | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

type AdminJobApplicationsPageProps = {
  searchParams?: Promise<{ page?: string; status?: string }>
}

export default async function AdminJobApplicationsPage({
  searchParams,
}: AdminJobApplicationsPageProps) {
  const params = (await searchParams) ?? {}

  if (!isSupabaseConfigured()) {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            Careers
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Job Applications
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Review job applications and download applicant CVs.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Supabase is not configured yet. Add your env keys to view job
            applications.
          </p>
        </div>
      </div>
    )
  }

  let loadError: string | null = null
  let pageData: Awaited<ReturnType<typeof getCareerApplicationsPageData>> | null =
    null

  try {
    pageData = await getCareerApplicationsPageData({
      page: params.page,
      status: params.status,
    })
  } catch {
    loadError =
      "Could not load job applications. Make sure you have created the `career_applications` table in Supabase."
  }

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
          Careers
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          Job Applications
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Review job applications and download applicant CVs.
        </p>
      </div>

      {loadError || !pageData ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {loadError}
        </div>
      ) : (
        <CareerApplicationsDashboard
          applications={pageData.applications}
          stats={pageData.stats}
          pagination={pageData.pagination}
          statusFilter={pageData.statusFilter}
          pathname="/admin/job-applications"
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
