import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { compareStartTime, formatLongDate, formatTaskTimeOnDay, isOverdueTask, taskTouchesDate } from "@/lib/work/dates"
import { hasLoggedWork, type StaffDailyLogView } from "@/lib/work/log-types"
import {
  STAFF_TASK_PRIORITY_LABELS,
  STAFF_TASK_STATUS_LABELS,
  type StaffTaskStatus,
  type StaffTaskView,
  type WorkAssignee,
} from "@/lib/work/task-types"

const PRIORITY_BADGE: Record<StaffTaskView["priority"], string> = {
  low: "border-0 bg-slate-500/10 text-slate-700 dark:text-slate-300",
  medium: "border-0 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  high: "border-0 bg-rose-500/10 text-rose-700 dark:text-rose-300",
}

const fieldClassName =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
const textareaClassName =
  "min-h-32 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
const labelClassName = "mb-1.5 block text-xs font-medium text-foreground"

export function WorkDayView({
  date,
  today,
  tasks,
  member,
  log,
  logsForDate,
  logsUnavailable,
  saving,
  onDateChange,
  onPrevDay,
  onNextDay,
  onToday,
  onOpenTask,
  onStatusChange,
  onSaveLog,
  onClearLog,
  onAddTask,
}: {
  date: string
  today: string
  tasks: StaffTaskView[]
  member: WorkAssignee | null
  log: StaffDailyLogView | null
  logsForDate: StaffDailyLogView[]
  logsUnavailable?: boolean
  saving: boolean
  onDateChange: (iso: string) => void
  onPrevDay: () => void
  onNextDay: () => void
  onToday: () => void
  onOpenTask: (task: StaffTaskView) => void
  onStatusChange: (taskId: string, status: StaffTaskStatus) => void
  onSaveLog: (summary: string, hoursSpent: string) => void
  onClearLog: () => void
  onAddTask: () => void
}) {
  const [summary, setSummary] = useState(log?.summary ?? "")
  const [hoursSpent, setHoursSpent] = useState(
    log?.hoursSpent == null ? "" : String(log.hoursSpent)
  )
  const isToday = date === today
  const overdueHere = tasks.filter((task) => isOverdueTask(task) && isToday)
  const scheduled = tasks
    .filter((task) => taskTouchesDate(task, date))
    .sort((a, b) => compareStartTime(a.startTime, b.startTime))
  const extraOverdue = overdueHere.filter((task) => !taskTouchesDate(task, date))
  const dayTasks = [...scheduled, ...extraOverdue]
  const loggedPeople = logsForDate.filter((item) => hasLoggedWork(item))

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">My Day</h2>
          <p className="text-xs text-muted-foreground">{formatLongDate(date)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevDay}
            className="size-9 rounded-xl p-0"
            aria-label="Previous day"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Input
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="h-9 w-[10.5rem] rounded-xl"
          />
          <Button
            type="button"
            variant="outline"
            onClick={onToday}
            className="h-9 rounded-xl px-3 text-xs"
          >
            Today
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onNextDay}
            className="size-9 rounded-xl p-0"
            aria-label="Next day"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            type="button"
            onClick={onAddTask}
            className="h-9 gap-1.5 rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
          >
            <Plus className="size-4" aria-hidden />
            Task
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
        <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              {isToday ? "Today’s work" : "Scheduled"}
            </h3>
            <span className="text-xs text-muted-foreground">
              {dayTasks.length} task{dayTasks.length === 1 ? "" : "s"}
            </span>
          </div>
          {dayTasks.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border/70 px-3 py-10 text-center text-sm text-muted-foreground">
              No tasks on this date.
            </p>
          ) : (
            <ul className="space-y-2">
              {dayTasks.map((task) => {
                const overdue = isOverdueTask(task)
                return (
                  <li
                    key={task.id}
                    className="rounded-xl border border-border/60 bg-background p-3"
                  >
                    <button
                      type="button"
                      onClick={() => onOpenTask(task)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {task.title}
                        </p>
                        <Badge className={PRIORITY_BADGE[task.priority]}>
                          {STAFF_TASK_PRIORITY_LABELS[task.priority]}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {task.assignee?.fullName ?? "Unassigned"}
                        {formatTaskTimeOnDay(task, date)
                          ? ` · ${formatTaskTimeOnDay(task, date)}`
                          : ""}
                        {overdue ? " · Overdue" : ""}
                      </p>
                    </button>
                    <select
                      value={task.status}
                      onChange={(event) =>
                        onStatusChange(
                          task.id,
                          event.target.value as StaffTaskStatus
                        )
                      }
                      className="mt-3 h-8 w-full rounded-lg border border-border bg-card px-2 text-xs outline-none"
                    >
                      {Object.entries(STAFF_TASK_STATUS_LABELS).map(
                        ([status, label]) => (
                          <option key={status} value={status}>
                            {label}
                          </option>
                        )
                      )}
                    </select>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">Daily log</h3>
          {logsUnavailable ? (
            <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">
              Run{" "}
              <code className="rounded bg-amber-100 px-1 py-0.5 text-xs dark:bg-amber-950">
                supabase/staff-daily-logs.sql
              </code>{" "}
              to enable check-ins.
            </p>
          ) : member ? (
            <form
              className="mt-3 space-y-3"
              onSubmit={(event) => {
                event.preventDefault()
                onSaveLog(summary, hoursSpent)
              }}
            >
              <p className="text-xs text-muted-foreground">
                {member.fullName}
                {hasLoggedWork(log) ? " · logged" : " · no log yet"}
              </p>
              <div>
                <label htmlFor="daily-log-summary" className={labelClassName}>
                  What I did
                </label>
                <textarea
                  id="daily-log-summary"
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  placeholder="A few lines on today’s work"
                  className={textareaClassName}
                  disabled={saving}
                />
              </div>
              <div>
                <label htmlFor="daily-log-hours" className={labelClassName}>
                  Hours spent
                </label>
                <Input
                  id="daily-log-hours"
                  type="number"
                  min="0"
                  max="24"
                  step="0.25"
                  value={hoursSpent}
                  onChange={(event) => setHoursSpent(event.target.value)}
                  placeholder="Optional"
                  className={fieldClassName}
                  disabled={saving}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
                >
                  Save log
                </Button>
                {log ? (
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={saving}
                    onClick={onClearLog}
                    className="rounded-xl"
                  >
                    Clear
                  </Button>
                ) : null}
              </div>
            </form>
          ) : (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-muted-foreground">
                Select a team member to write their daily log.
              </p>
              {loggedPeople.length > 0 ? (
                <ul className="space-y-2">
                  {loggedPeople.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-xl border border-border/60 bg-background p-3"
                    >
                      <p className="text-sm font-medium text-foreground">
                        {item.member?.fullName ?? "Team member"}
                      </p>
                      <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
                        {item.summary}
                      </p>
                      {item.hoursSpent != null ? (
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {item.hoursSpent}h
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl border border-dashed border-border/70 px-3 py-8 text-center text-xs text-muted-foreground">
                  Nobody has logged this day yet.
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
