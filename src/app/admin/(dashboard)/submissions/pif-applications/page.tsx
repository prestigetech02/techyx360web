import { PifApplicationsDashboard } from "@/components/admin/pif-applications-dashboard"
import { brand } from "@/config/brand"
import { getRegistrationReceiptSignedUrl } from "@/lib/registrations/receipt-upload"
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
      "id, first_name, last_name, email, phone, education_experience, preferred_track, portfolio_url, motivation, goals, program_commitment_agreed, payment_receipt_path, status, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100)

  const applications = error
    ? []
    : await Promise.all(
        (data ?? []).map(async (application) => {
          if (!application.payment_receipt_path) {
            return { ...application, payment_receipt_url: null }
          }

          const payment_receipt_url = await getRegistrationReceiptSignedUrl(
            application.payment_receipt_path
          )

          return { ...application, payment_receipt_url }
        })
      )

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
          Could not load PIF applications. Make sure you have run{" "}
          <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs">
            supabase/pif-applications.sql
          </code>{" "}
          and{" "}
          <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs">
            supabase/pif-applications-payment-receipt-migration.sql
          </code>{" "}
          in Supabase.
        </div>
      ) : (
        <PifApplicationsDashboard applications={applications} />
      )}
    </div>
  )
}
