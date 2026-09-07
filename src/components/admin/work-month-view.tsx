import { ChevronLeft, ChevronRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  compareStartTime,
  formatMonthYear,
  formatTimeOfDay,
  isOverdueTask,
  monthCells,
  startOfMonth,
} from "@/lib/work/dates"
import { type StaffTaskView } from "@/lib/work/task-types"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function WorkMonthView({
  monthStart,
  selectedDate,
  today,
  tasks,
  onPrevMonth,
  onNextMonth,
  onThisMonth,
  onSelectDay,
  onOpenTask,
}: {
  monthStart: string
  selectedDate: string
  today: string
  tasks: StaffTaskView[]
  onPrevMonth: () => void
  onNextMonth: () => void
  onThisMonth: () => void
  onSelectDay: (iso: string) => void
  onOpenTask: (task: StaffTaskView) => void
}) {
  const start = startOfMonth(monthStart)
  const cells = monthCells(start)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Month</h2>
          <p className="text-xs text-muted-foreground">{formatMonthYear(start)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevMonth}
            className="size-9 rounded-xl p-0"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onThisMonth}
            className="h-9 rounded-xl px-3 text-xs"
          >
            This month
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onNextMonth}
            className="size-9 rounded-xl p-0"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card p-3 shadow-sm">
        <div className="grid min-w-[52rem] grid-cols-7 gap-2">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="px-1 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            >
              {day}
            </div>
          ))}
          {cells.map((cell) => {
            const dayTasks = tasks
              .filter((task) => task.scheduledOn === cell.iso)
              .sort((a, b) => compareStartTime(a.startTime, b.startTime))
            const isToday = cell.iso === today
            const isSelected = cell.iso === selectedDate
            return (
              <div
                key={cell.iso}
                className={cn(
                  "flex min-h-28 flex-col rounded-xl border p-2",
                  cell.inMonth
                    ? "border-border/60 bg-background"
                    : "border-transparent bg-muted/30",
                  isToday && "border-brand/50 bg-brand/5",
                  isSelected && "ring-2 ring-brand/30"
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelectDay(cell.iso)}
                  className={cn(
                    "mb-1 text-left text-xs font-semibold",
                    cell.inMonth ? "text-foreground" : "text-muted-foreground",
                    isToday && "text-brand"
                  )}
                >
                  {cell.iso.slice(8)}
                </button>
                <div className="flex flex-1 flex-col gap-1">
                  {dayTasks.slice(0, 3).map((task) => {
                    const overdue = isOverdueTask(task)
                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => onOpenTask(task)}
                        className="truncate rounded-lg bg-muted/70 px-1.5 py-1 text-left text-[11px] font-medium text-foreground hover:bg-muted"
                      >
                        {task.startTime
                          ? `${formatTimeOfDay(task.startTime)} ${task.title}`
                          : task.title}
                        {overdue ? (
                          <Badge className="ml-1 border-0 bg-rose-500/10 px-1 py-0 text-[9px] text-rose-700 dark:text-rose-300">
                            Overdue
                          </Badge>
                        ) : null}
                      </button>
                    )
                  })}
                  {dayTasks.length > 3 ? (
                    <button
                      type="button"
                      onClick={() => onSelectDay(cell.iso)}
                      className="text-left text-[11px] text-muted-foreground"
                    >
                      +{dayTasks.length - 3} more
                    </button>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
