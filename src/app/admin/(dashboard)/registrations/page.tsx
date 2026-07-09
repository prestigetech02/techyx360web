import { brand } from "@/config/brand"

export const metadata = {
  title: `Course Registrations | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminRegistrationsPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
          Trainings
        </p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900 sm:text-3xl">
          Course Registrations
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          View and manage training registration submissions from the website.
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Registration data will appear here once connected to Supabase.
        </p>
      </div>
    </div>
  )
}
