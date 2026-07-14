import { TalentPoolDashboard } from "@/components/admin/talent-pool-dashboard"
import { brand } from "@/config/brand"
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Talent Pool | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminTalentPoolPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            Careers
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Talent Pool
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Review candidates who joined the Techyx360 talent pool for future
            openings.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Supabase is not configured yet. Add your env keys to view talent
            pool submissions.
          </p>
        </div>
      </div>
    )
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("talent_pool_submissions")
    .select(
      "id, full_name, email, phone, location, linkedin_url, github_url, portfolio_url, cv_path, interest_areas, years_of_experience, expected_salary, message, availability, status, created_at"
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
          Talent Pool
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Review candidates who joined the Techyx360 talent pool for future
          openings.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          Could not load talent pool submissions. Make sure you have created the
          `talent_pool_submissions` table in Supabase.
        </div>
      ) : (
        <TalentPoolDashboard submissions={data ?? []} />
      )}
    </div>
  )
}
