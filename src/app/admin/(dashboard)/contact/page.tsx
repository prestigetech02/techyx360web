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
          <h1 className="mt-2 text-2xl font-bold text-zinc-900 sm:text-3xl">
            Contact
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Review contact form submissions and follow up with enquiries.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Supabase is not configured yet. Add your env keys to view contact submissions.
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
    .limit(50)

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
          Inbox
        </p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900 sm:text-3xl">
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
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Submissions</h2>
            <p className="text-sm text-muted-foreground">
              Latest website enquiries from the contact page.
            </p>
          </div>
          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            {(data ?? []).length} total
          </span>
        </div>

        {data && data.length > 0 ? (
          <div className="divide-y divide-border/60">
            {data.map((submission) => (
              <article key={submission.id} className="space-y-4 px-6 py-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900">
                      {submission.first_name} {submission.last_name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {submission.email} | {submission.phone}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-brand/10 px-2.5 py-1 font-semibold uppercase tracking-wide text-brand">
                      {submission.status}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(submission.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-zinc-700">
                  {submission.message}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            No contact submissions yet.
          </div>
        )}
      </div>
    </div>
  )
}
