import { brand } from "@/config/brand"

export const metadata = {
  title: `Students | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminStudentsPage() {
  return (
    <div className="min-w-0 space-y-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
          Trainings
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          Students
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Manage enrolled students, cohorts, and training progress across
          programmes.
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Student records will appear here once connected to Supabase.
        </p>
      </div>
    </div>
  )
}
