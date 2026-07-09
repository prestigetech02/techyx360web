import { brand } from "@/config/brand"

export const metadata = {
  title: `Dashboard | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
          Overview
        </p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900 sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Welcome to your Techyx360 admin dashboard. Manage course registrations,
          contact submissions, and blog content from here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Course Registrations", value: "—" },
          { label: "Contact Messages", value: "—" },
          { label: "Blog Posts", value: "—" },
          { label: "Notifications", value: "0" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-zinc-900">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
