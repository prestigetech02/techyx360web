import { PifFellowsDashboard } from "@/components/admin/pif-fellows-dashboard"
import { brand } from "@/config/brand"
import { getPifFellowsPageData } from "@/lib/pif/fellows"
import { listPifTeams } from "@/lib/pif/teams"
import { isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Fellows | PIF | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

type PageProps = {
  searchParams?: Promise<{
    page?: string
    status?: string
  }>
}

export default async function AdminPifFellowsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {}

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-w-0 space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Fellows</h1>
        <p className="text-sm text-muted-foreground">
          Supabase is not configured yet.
        </p>
      </div>
    )
  }

  try {
    const [data, teams] = await Promise.all([
      getPifFellowsPageData({
        page: params.page,
        status: params.status,
      }),
      listPifTeams().catch(() => []),
    ])

    return (
      <PifFellowsDashboard
        fellows={data.fellows}
        teams={teams}
        stats={data.stats}
        pagination={data.pagination}
        statusFilter={data.statusFilter}
        pathname="/admin/programs/pif/fellows"
        query={{
          ...(params.status ? { status: params.status } : {}),
          ...(params.page ? { page: params.page } : {}),
        }}
      />
    )
  } catch {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
        Could not load fellows. Run{" "}
        <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs dark:bg-red-950/50">
          supabase/pif-fellows.sql
        </code>{" "}
        and{" "}
        <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs dark:bg-red-950/50">
          supabase/pif-teams.sql
        </code>{" "}
        in Supabase.
      </div>
    )
  }
}
