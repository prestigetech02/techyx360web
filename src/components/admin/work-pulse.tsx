import { hasLoggedWork, type StaffDailyLogView } from "@/lib/work/log-types"
import { isOverdueTask } from "@/lib/work/dates"
import type { StaffTaskView, WorkAssignee } from "@/lib/work/task-types"
import { cn } from "@/lib/utils"

export type WorkPulseItem = {
  member: WorkAssignee
  logged: boolean
  label: "Done" | "In progress" | "Blocked" | "No log"
  overdueCount: number
  openCount: number
}

export function buildWorkPulse(
  assignees: WorkAssignee[],
  tasks: StaffTaskView[],
  logs: StaffDailyLogView[],
  today: string
): WorkPulseItem[] {
  const members = assignees.filter((member) => member.status !== "inactive")

  return members.map((member) => {
    const todaysTasks = tasks.filter(
      (task) => task.assigneeId === member.id && task.scheduledOn === today
    )
    const overdueCount = tasks.filter(
      (task) => task.assigneeId === member.id && isOverdueTask(task)
    ).length
    const log = logs.find(
      (item) => item.memberId === member.id && item.logDate === today
    )
    const logged = hasLoggedWork(log)
    const openCount = todaysTasks.filter((task) => task.status !== "done").length
    const blocked = todaysTasks.some((task) => task.status === "blocked")
    const inProgress = todaysTasks.some(
      (task) => task.status === "in_progress" || task.status === "todo"
    )

    let label: WorkPulseItem["label"] = "No log"
    if (!logged) {
      label = "No log"
    } else if (blocked) {
      label = "Blocked"
    } else if (inProgress || overdueCount > 0) {
      label = "In progress"
    } else {
      label = "Done"
    }

    return {
      member,
      logged,
      label,
      overdueCount,
      openCount,
    }
  })
}

const LABEL_CLASS: Record<WorkPulseItem["label"], string> = {
  Done: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "In progress": "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  Blocked: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  "No log": "bg-slate-500/10 text-slate-600 dark:text-slate-300",
}

export function WorkPulse({
  items,
  logsUnavailable,
  onSelectMember,
}: {
  items: WorkPulseItem[]
  logsUnavailable?: boolean
  onSelectMember?: (memberId: string) => void
}) {
  const loggedCount = items.filter((item) => item.logged).length
  const silentCount = items.filter((item) => !item.logged).length

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Team pulse</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Today: {loggedCount} logged · {silentCount} no log
          </p>
        </div>
        {logsUnavailable ? (
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Daily logs need{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5 text-[11px] dark:bg-amber-950">
              supabase/staff-daily-logs.sql
            </code>
          </p>
        ) : null}
      </div>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Add team members to see today&apos;s activity.
        </p>
      ) : (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {items.map((item) => (
            <button
              key={item.member.id}
              type="button"
              onClick={() => onSelectMember?.(item.member.id)}
              className="min-w-[10.5rem] rounded-xl border border-border/60 bg-background p-3 text-left transition hover:border-border hover:shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                    item.member.accent
                  )}
                >
                  {item.member.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.member.fullName}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {item.member.role}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    LABEL_CLASS[item.label]
                  )}
                >
                  {item.label}
                </span>
                {item.overdueCount > 0 ? (
                  <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                    {item.overdueCount} overdue
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground">
                    {item.openCount} open
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
