import type { DragEvent } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  compareStartTime,
  formatDayHeading,
  formatTaskTimeOnDay,
  formatWeekRange,
  isOverdueTask,
  taskTouchesDate,
  weekDates,
} from "@/lib/work/dates"
import { hasLoggedWork, type StaffDailyLogView } from "@/lib/work/log-types"
import {
  STAFF_TASK_STATUS_LABELS,
  type StaffTaskView,
} from "@/lib/work/task-types"
import { cn } from "@/lib/utils"

export function WorkWeekView({
  weekStart,
  selectedDate,
  today,
  tasks,
  logs,
  dropDate,
  onPrevWeek,
  onNextWeek,
  onThisWeek,
  onSelectDay,
  onOpenTask,
  onDragOverDay,
  onDropOnDay,
}: {
  weekStart: string
  selectedDate: string
  today: string
  tasks: StaffTaskView[]
  logs: StaffDailyLogView[]
  dropDate: string | null
  onPrevWeek: () => void
  onNextWeek: () => void
  onThisWeek: () => void
  onSelectDay: (iso: string) => void
  onOpenTask: (task: StaffTaskView) => void
  onDragOverDay: (iso: string | null) => void
  onDropOnDay: (iso: string, event: DragEvent<HTMLDivElement>) => void
}) {
  const days = weekDates(weekStart)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Week</h2>
          <p className="text-xs text-muted-foreground">
            {formatWeekRange(weekStart)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevWeek}
            className="size-9 rounded-xl p-0"
            aria-label="Previous week"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onThisWeek}
            className="h-9 rounded-xl px-3 text-xs"
          >
            This week
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onNextWeek}
            className="size-9 rounded-xl p-0"
            aria-label="Next week"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid auto-cols-[minmax(14rem,1fr)] grid-flow-col gap-3 overflow-x-auto pb-2 lg:auto-cols-fr lg:grid-cols-7">
        {days.map((iso) => {
          const dayTasks = tasks
            .filter((task) => taskTouchesDate(task, iso))
            .sort((a, b) => compareStartTime(a.startTime, b.startTime) || a.sortOrder - b.sortOrder)
          const loggedCount = logs.filter(
            (log) => log.logDate === iso && hasLoggedWork(log)
          ).length
          const isToday = iso === today

          return (
            <div
              key={iso}
              onDragOver={(event) => {
                event.preventDefault()
                event.dataTransfer.dropEffect = "move"
                onDragOverDay(iso)
              }}
              onDragLeave={() => onDragOverDay(null)}
              onDrop={(event) => onDropOnDay(iso, event)}
              className={cn(
                "flex min-h-72 flex-col rounded-2xl border bg-muted/30 p-3",
                isToday && "border-brand/50 bg-brand/5",
                selectedDate === iso && "ring-2 ring-brand/30",
                dropDate === iso && "ring-2 ring-brand/40"
              )}
            >
              <button
                type="button"
                onClick={() => onSelectDay(iso)}
                className="mb-3 flex items-start justify-between gap-2 text-left"
              >
                <span
                  className={cn(
                    "text-sm font-semibold",
                    isToday ? "text-brand" : "text-foreground"
                  )}
                >
                  {formatDayHeading(iso)}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {loggedCount} log{loggedCount === 1 ? "" : "s"}
                </span>
              </button>
              <div className="flex flex-1 flex-col gap-2">
                {dayTasks.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border/70 px-2 py-6 text-center text-xs text-muted-foreground">
                    No tasks
                  </p>
                ) : (
                  dayTasks.map((task) => {
                    const overdue = isOverdueTask(task)
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.setData("text/plain", task.id)
                          event.dataTransfer.effectAllowed = "move"
                        }}
                        className="cursor-grab rounded-xl border border-border/60 bg-background p-2.5 shadow-sm"
                      >
                        <button
                          type="button"
                          onClick={() => onOpenTask(task)}
                          className="w-full text-left"
                        >
                          <p className="text-sm font-medium text-foreground">
                            {task.title}
                          </p>
                          {formatTaskTimeOnDay(task, iso) ? (
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {formatTaskTimeOnDay(task, iso)}
                            </p>
                          ) : null}
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <span className="truncate text-[11px] text-muted-foreground">
                              {task.assignee?.fullName ?? "Unassigned"}
                            </span>
                            <Badge
                              className={cn(
                                "border-0 text-[10px]",
                                overdue
                                  ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {overdue
                                ? "Overdue"
                                : STAFF_TASK_STATUS_LABELS[task.status]}
                            </Badge>
                          </div>
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
