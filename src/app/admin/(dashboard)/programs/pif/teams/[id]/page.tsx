import { notFound } from "next/navigation"

import { PifTeamDetail } from "@/components/admin/pif-team-detail"
import { brand } from "@/config/brand"
import { getTeamSessionRoster } from "@/lib/pif/attendance"
import { getPifTeamById, listTeamFellows } from "@/lib/pif/teams"
import { isSupabaseConfigured } from "@/lib/supabase"

type PageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  return {
    title: `Team | PIF | Admin | ${brand.name}`,
    robots: { index: false, follow: false },
    alternates: { canonical: `/admin/programs/pif/teams/${id}` },
  }
}

export default async function AdminPifTeamDetailPage({ params }: PageProps) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-w-0 space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Team</h1>
        <p className="text-sm text-muted-foreground">
          Supabase is not configured yet.
        </p>
      </div>
    )
  }

  const { id } = await params

  try {
    const team = await getPifTeamById(id)
    if (!team) notFound()

    const [fellows, roster] = await Promise.all([
      listTeamFellows(id),
      getTeamSessionRoster(id),
    ])

    return (
      <PifTeamDetail
        key={`${team.id}-${team.updatedAt}-${team.attendanceOpen}-${team.currentWeek}-${team.currentDay}`}
        team={team}
        fellows={fellows}
        roster={roster}
      />
    )
  } catch {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
        Could not load team. Run{" "}
        <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs dark:bg-red-950/50">
          supabase/pif-teams.sql
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
