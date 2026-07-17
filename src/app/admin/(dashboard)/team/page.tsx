import { TeamDashboard } from "@/components/admin/team-dashboard"
import { brand } from "@/config/brand"
import { getAllTeamMembers } from "@/lib/team/members"
import { isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Team | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminTeamPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-w-0 space-y-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            Team
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Team
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage internal staff, roles, and team directory.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Supabase is not configured yet. Add your env keys to view team
            members.
          </p>
        </div>
      </div>
    )
  }

  try {
    const members = await getAllTeamMembers()
    return <TeamDashboard members={members} />
  } catch {
    return (
      <div className="min-w-0 space-y-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            Team
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Team
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage internal staff, roles, and team directory.
          </p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Could not load team members. Make sure you have run{" "}
          <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs">
            supabase/team-members.sql
          </code>{" "}
          and{" "}
          <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs">
            supabase/team-members-profile-migration.sql
          </code>{" "}
          in Supabase.
        </div>
      </div>
    )
  }
}
