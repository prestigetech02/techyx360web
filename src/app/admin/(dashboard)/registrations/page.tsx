import { CourseRegistrationsDashboard } from "@/components/admin/course-registrations-dashboard"
import { brand } from "@/config/brand"
import { getCourseRegistrationsPageData } from "@/lib/admin/course-registrations"
import { isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Course Registrations | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

type AdminRegistrationsPageProps = {
  searchParams?: Promise<{ page?: string; status?: string }>
}

export default async function AdminRegistrationsPage({
  searchParams,
}: AdminRegistrationsPageProps) {
  const params = (await searchParams) ?? {}

  if (!isSupabaseConfigured()) {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            Trainings
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Course Registrations
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            View and manage training registration submissions from the website.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Supabase is not configured yet. Add your env keys to view course
            registrations.
          </p>
        </div>
      </div>
    )
  }

  let loadError: string | null = null
  let pageData: Awaited<
    ReturnType<typeof getCourseRegistrationsPageData>
  > | null = null

  try {
    pageData = await getCourseRegistrationsPageData({
      page: params.page,
      status: params.status,
    })
  } catch {
    loadError =
      "Could not load course registrations. Make sure you have created the `course_registrations` table in Supabase."
  }

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
          Trainings
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          Course Registrations
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          View and manage training registration submissions from the website.
        </p>
      </div>

      {loadError || !pageData ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {loadError}
        </div>
      ) : (
        <CourseRegistrationsDashboard
          registrations={pageData.registrations}
          stats={pageData.stats}
          pagination={pageData.pagination}
          statusFilter={pageData.statusFilter}
          pathname="/admin/registrations"
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
