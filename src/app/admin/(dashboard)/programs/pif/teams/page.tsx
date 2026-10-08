import { PifTeamsDashboard } from "@/components/admin/pif-teams-dashboard"
import { brand } from "@/config/brand"
import { listPifTeams } from "@/lib/pif/teams"
import { isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Teams | PIF | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminPifTeamsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-w-0 space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Teams</h1>
        <p className="text-sm text-muted-foreground">
          Supabase is not configured yet.
        </p>
      </div>
    )
  }

  try {
    const teams = await listPifTeams()
    return <PifTeamsDashboard teams={teams} />
  } catch {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
        Could not load teams. Run{" "}
        <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs dark:bg-red-950/50">
          supabase/pif-teams.sql
        </code>{" "}
        in Supabase.
      </div>
    )
  }
}
