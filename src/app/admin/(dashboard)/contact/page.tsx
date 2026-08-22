import { ContactSubmissionsDashboard } from "@/components/admin/contact-submissions-dashboard"
import { brand } from "@/config/brand"
import { getContactSubmissionsPageData } from "@/lib/admin/contact-submissions"
import { isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Contact | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

type AdminContactPageProps = {
  searchParams?: Promise<{ page?: string; status?: string }>
}

export default async function AdminContactPage({
  searchParams,
}: AdminContactPageProps) {
  const params = (await searchParams) ?? {}

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

  let loadError: string | null = null
  let pageData: Awaited<
    ReturnType<typeof getContactSubmissionsPageData>
  > | null = null

  try {
    pageData = await getContactSubmissionsPageData({
      page: params.page,
      status: params.status,
    })
  } catch {
    loadError =
      "Could not load contact submissions. Make sure you have created the `contact_submissions` table in Supabase."
  }

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

      {loadError || !pageData ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {loadError}
        </div>
      ) : (
        <ContactSubmissionsDashboard
          submissions={pageData.submissions}
          stats={pageData.stats}
          pagination={pageData.pagination}
          statusFilter={pageData.statusFilter}
          pathname="/admin/contact"
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
