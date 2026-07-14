import { CareerApplicationsDashboard } from "@/components/admin/career-applications-dashboard"
import { brand } from "@/config/brand"
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Job Applications | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminJobApplicationsPage() {
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

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("career_applications")
    .select(
      "id, position_id, position_title, full_name, email, phone, location, linkedin_url, github_url, portfolio_url, cv_path, years_of_experience, expected_salary, cover_letter, availability, status, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100)

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

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          Could not load job applications. Make sure you have created the
          `career_applications` table in Supabase.
        </div>
      ) : (
        <CareerApplicationsDashboard applications={data ?? []} />
      )}
    </div>
  )
}
