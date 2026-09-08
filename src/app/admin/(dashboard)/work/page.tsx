import { WorkDashboard, type WorkViewMode } from "@/components/admin/work-dashboard"
import { brand } from "@/config/brand"
import { getDashboardAccess } from "@/lib/admin/require-admin"
import { isSupabaseConfigured } from "@/lib/supabase"
import { isIsoDate } from "@/lib/work/dates"
import { getStaffDailyLogs } from "@/lib/work/logs"
import type { StaffDailyLogView } from "@/lib/work/log-types"
import { getAllStaffTasks, getWorkAssignees } from "@/lib/work/tasks"
import type { StaffTaskView, WorkAssignee } from "@/lib/work/task-types"
import type { ReactNode } from "react"

export const metadata = {
  title: `Tasks | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

type AdminWorkPageProps = {
  searchParams?: Promise<{
    task?: string
    assignee?: string
    view?: string
    date?: string
  }>
}

const WORK_VIEWS = new Set<WorkViewMode>([
  "board",
  "list",
  "week",
  "month",
  "day",
])

function isWorkView(value: string): value is WorkViewMode {
  return WORK_VIEWS.has(value as WorkViewMode)
}

function WorkPageShell({
  description,
  children,
}: {
  description: string
  children: ReactNode
}) {
  return (
    <div className="min-w-0 space-y-5">
      <div>
        <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
          Tasks
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          Tasks
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  )
}

export default async function AdminWorkPage({
  searchParams,
}: AdminWorkPageProps) {
  const params = (await searchParams) ?? {}
  const access = await getDashboardAccess()
  const isStaff = access?.kind === "staff"
  const selfMemberId = access?.memberId ?? null
  const initialTaskId =
    typeof params.task === "string" && params.task.trim()
      ? params.task.trim()
      : null
  const initialAssigneeId =
    isStaff
      ? selfMemberId
      : typeof params.assignee === "string" && params.assignee.trim()
        ? params.assignee.trim()
        : null
  const initialView =
    typeof params.view === "string" && isWorkView(params.view)
      ? params.view
      : null
  const initialDate =
    typeof params.date === "string" && isIsoDate(params.date)
      ? params.date
      : null

  const pageDescription = isStaff
    ? "Your assigned tasks — create work, update status, and log your day."
    : "Internal staff tasks — assign work, review the calendar, and log what got done."

  if (!isSupabaseConfigured()) {
    return (
      <WorkPageShell description={pageDescription}>
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Supabase is not configured yet. Add your env keys to view staff
            tasks.
          </p>
        </div>
      </WorkPageShell>
    )
  }

  if (isStaff && !selfMemberId) {
    return (
      <WorkPageShell description={pageDescription}>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
          Your login is not linked to a team member yet. Ask an admin to add
          your email in Team and send a login invite.
        </div>
      </WorkPageShell>
    )
  }

  let tasks: StaffTaskView[] | null = null
  let assignees: WorkAssignee[] | null = null
  let loadError = false

  try {
    const result = await Promise.all([
      getAllStaffTasks(
        isStaff && selfMemberId ? { assigneeId: selfMemberId } : undefined
      ),
      getWorkAssignees(),
    ])
    tasks = result[0]
    assignees = result[1]
  } catch {
    loadError = true
  }

  if (loadError || !tasks || !assignees) {
    return (
      <WorkPageShell description={pageDescription}>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Could not load staff tasks. Make sure you have run{" "}
          <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs">
            supabase/team-members.sql
          </code>{" "}
          and{" "}
          <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs">
            supabase/staff-tasks.sql
          </code>{" "}
          and{" "}
          <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs">
            supabase/staff-tasks-date-range-migration.sql
          </code>{" "}
          in Supabase.
        </div>
      </WorkPageShell>
    )
  }

  let logs: StaffDailyLogView[] = []
  let logsUnavailable = false

  try {
    logs = await getStaffDailyLogs(
      isStaff && selfMemberId ? { memberId: selfMemberId } : undefined
    )
  } catch {
    logsUnavailable = true
  }

  const visibleAssignees =
    isStaff && selfMemberId
      ? assignees.filter((member) => member.id === selfMemberId)
      : assignees

  return (
    <WorkDashboard
      tasks={tasks}
      assignees={visibleAssignees}
      logs={logs}
      logsUnavailable={logsUnavailable}
      initialTaskId={initialTaskId}
      initialAssigneeId={initialAssigneeId}
      initialView={initialView}
      initialDate={initialDate}
      accessKind={isStaff ? "staff" : "admin"}
      selfMemberId={selfMemberId}
    />
  )
}
