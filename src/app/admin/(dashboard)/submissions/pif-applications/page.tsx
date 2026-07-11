import { PifApplicationsDashboard } from "@/components/admin/pif-applications-dashboard"
import { brand } from "@/config/brand"
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `PIF Applications | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminPifApplicationsPage() {
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

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("pif_applications")
    .select(
      "id, first_name, last_name, email, phone, education_experience, preferred_track, portfolio_url, motivation, goals, program_commitment_agreed, status, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100)

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

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Could not load PIF applications. Make sure you have created the
          `pif_applications` table in Supabase.
        </div>
      ) : (
        <PifApplicationsDashboard applications={data ?? []} />
      )}
    </div>
  )
}
