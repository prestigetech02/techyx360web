import { LeadsDashboard } from "@/components/admin/leads-dashboard"
import { brand } from "@/config/brand"
import { getLeadsPageData } from "@/lib/admin/leads-page"
import { getAllTeamMembers } from "@/lib/team/members"
import { isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Leads | CRM | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

type AdminLeadsPageProps = {
  searchParams?: Promise<{
    page?: string
    status?: string
    q?: string
    source?: string
    assigned?: string
    minScore?: string
  }>
}

export default async function AdminLeadsPage({
  searchParams,
}: AdminLeadsPageProps) {
  const params = (await searchParams) ?? {}

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-w-0 space-y-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            CRM
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Leads
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage and track your potential customers.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Supabase is not configured yet. Add your env keys to view CRM leads.
          </p>
        </div>
      </div>
    )
  }

  try {
    const [pageData, teamMembers] = await Promise.all([
      getLeadsPageData({
        page: params.page,
        status: params.status,
        q: params.q,
        source: params.source,
        assigned: params.assigned,
        minScore: params.minScore,
      }),
      getAllTeamMembers().catch(() => []),
    ])

    const assignees = teamMembers
      .filter((member) => member.status === "active")
      .map((member) => ({
        id: member.id,
        fullName: member.fullName,
        role: member.role,
        department: member.department,
        email: member.email,
        initials: member.initials,
        accent: member.accent,
      }))

    const listQuery = {
      ...(pageData.statusFilter !== "all"
        ? { status: pageData.statusFilter }
        : {}),
      ...(pageData.listFilters.q ? { q: pageData.listFilters.q } : {}),
      ...(pageData.listFilters.source
        ? { source: pageData.listFilters.source }
        : {}),
      ...(pageData.listFilters.assigned
        ? { assigned: pageData.listFilters.assigned }
        : {}),
      ...(pageData.listFilters.minScore
        ? { minScore: pageData.listFilters.minScore }
        : {}),
    }

    return (
      <LeadsDashboard
        leads={pageData.leads}
        assignees={assignees}
        stats={pageData.stats}
        pagination={pageData.pagination}
        statusFilter={pageData.statusFilter}
        listFilters={pageData.listFilters}
        pathname="/admin/leads"
        query={Object.keys(listQuery).length > 0 ? listQuery : undefined}
      />
    )
  } catch {
    return (
      <div className="min-w-0 space-y-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            CRM
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Leads
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage and track your potential customers.
          </p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          Could not load leads. Make sure you have run{" "}
          <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs dark:bg-red-950/50">
            supabase/crm-leads.sql
          </code>{" "}
          and related CRM migrations in Supabase.
        </div>
      </div>
    )
  }
}
