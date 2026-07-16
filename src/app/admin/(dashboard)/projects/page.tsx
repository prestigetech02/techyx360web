import { ProjectsDashboard } from "@/components/admin/projects-dashboard"
import { brand } from "@/config/brand"
import { getAllClients } from "@/lib/crm/clients"
import type { ProjectClientOption } from "@/lib/crm/project-types"
import { getAllProjects } from "@/lib/crm/projects"
import { isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Projects | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

type AdminProjectsPageProps = {
  searchParams?: Promise<{ project?: string; client?: string }>
}

export default async function AdminProjectsPage({
  searchParams,
}: AdminProjectsPageProps) {
  const params = (await searchParams) ?? {}
  const initialProjectId =
    typeof params.project === "string" && params.project.trim()
      ? params.project.trim()
      : null
  const initialClientId =
    typeof params.client === "string" && params.client.trim()
      ? params.client.trim()
      : null

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-w-0 space-y-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            Projects
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Projects
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage all client projects and track progress.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Supabase is not configured yet. Add your env keys to view projects.
          </p>
        </div>
      </div>
    )
  }

  try {
    const [projects, clients] = await Promise.all([
      getAllProjects(),
      getAllClients(),
    ])

    const clientOptions: ProjectClientOption[] = clients.map((client) => ({
      id: client.id,
      company: client.company,
    }))

    return (
      <ProjectsDashboard
        projects={projects}
        clients={clientOptions}
        initialProjectId={initialProjectId}
        initialClientId={initialClientId}
      />
    )
  } catch {
    return (
      <div className="min-w-0 space-y-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            Projects
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Projects
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage all client projects and track progress.
          </p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Could not load projects. Make sure you have run{" "}
          <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs">
            supabase/crm-leads.sql
          </code>{" "}
          and{" "}
          <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs">
            supabase/crm-projects.sql
          </code>{" "}
          in Supabase.
        </div>
      </div>
    )
  }
}
