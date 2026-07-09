import { brand } from "@/config/brand"
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Dashboard | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminDashboardPage() {
  let registrationCount = "—"
  let contactCount = "—"
  let notificationCount = "0"

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient()

    const [
      registrationsResult,
      contactsResult,
      newRegistrationsResult,
      newContactsResult,
    ] = await Promise.all([
      supabase
        .from("course_registrations")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("contact_submissions")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("course_registrations")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
      supabase
        .from("contact_submissions")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
    ])

    if (!registrationsResult.error) {
      registrationCount = String(registrationsResult.count ?? 0)
    }

    if (!contactsResult.error) {
      contactCount = String(contactsResult.count ?? 0)
    }

    const newRegistrationCount = newRegistrationsResult.error
      ? 0
      : (newRegistrationsResult.count ?? 0)
    const newContactCount = newContactsResult.error
      ? 0
      : (newContactsResult.count ?? 0)

    notificationCount = String(newRegistrationCount + newContactCount)
  }

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
          Overview
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Welcome to your Techyx360 admin dashboard. Manage course registrations,
          contact submissions, and blog content from here.
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-4 gap-2 sm:gap-4">
        {[
          { label: "Course Registrations", value: registrationCount },
          { label: "Contact Messages", value: contactCount },
          { label: "Blog Posts", value: "—" },
          { label: "Notifications", value: notificationCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border/60 bg-card p-3 shadow-sm sm:p-5"
          >
            <p className="truncate text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
            <p className="mt-1 text-xl font-bold text-foreground sm:mt-2 sm:text-2xl">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
