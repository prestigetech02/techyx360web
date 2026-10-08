import { PifAttendanceAdminPanel } from "@/components/admin/pif-attendance-admin-panel"
import { brand } from "@/config/brand"
import {
  getAttendanceSummary,
  listAttendanceHistory,
} from "@/lib/pif/attendance"
import { listPifTeams } from "@/lib/pif/teams"
import { isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Attendance | PIF | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminPifAttendancePage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-w-0 space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
        <p className="text-sm text-muted-foreground">
          Supabase is not configured yet.
        </p>
      </div>
    )
  }

  try {
    const [summary, history, teams] = await Promise.all([
      getAttendanceSummary(),
      listAttendanceHistory({ limit: 200 }),
      listPifTeams(),
    ])

    return (
      <PifAttendanceAdminPanel
        summary={summary}
        history={history}
        teams={teams}
      />
    )
  } catch {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
        Could not load attendance. Run{" "}
        <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs dark:bg-red-950/50">
          supabase/pif-attendance.sql
        </code>
        ,{" "}
        <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs dark:bg-red-950/50">
          supabase/pif-attendance-per-team.sql
        </code>
        , and{" "}
        <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs dark:bg-red-950/50">
          supabase/pif-attendance-hardening.sql
        </code>{" "}
        in Supabase.
      </div>
    )
  }
}
