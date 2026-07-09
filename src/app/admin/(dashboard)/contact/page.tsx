import { ContactSubmissionsDashboard } from "@/components/admin/contact-submissions-dashboard"
import { brand } from "@/config/brand"
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Contact | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminContactPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            Inbox
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Contact
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Review contact form submissions and follow up with enquiries.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Supabase is not configured yet. Add your env keys to view contact
            submissions.
          </p>
        </div>
      </div>
    )
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("contact_submissions")
    .select("id, first_name, last_name, email, phone, message, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100)

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
          Inbox
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          Contact
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Review contact form submissions and follow up with enquiries.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Could not load contact submissions. Make sure you have created the
          `contact_submissions` table in Supabase.
        </div>
      ) : (
        <ContactSubmissionsDashboard submissions={data ?? []} />
      )}
    </div>
  )
}
