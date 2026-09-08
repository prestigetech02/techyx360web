"use client"

import {
  useMemo,
  useState,
  useTransition,
  type ComponentType,
  type DragEvent,
  type FormEvent,
} from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  CircleDashed,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  Search,
  Timer,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { WorkDayView } from "@/components/admin/work-day-view"
import { WorkMonthView } from "@/components/admin/work-month-view"
import { WorkPulse, buildWorkPulse } from "@/components/admin/work-pulse"
import { WorkWeekView } from "@/components/admin/work-week-view"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"
import {
  addDaysIso,
  addMonthsIso,
  formatDurationMinutes,
  formatTaskDate,
  formatTaskSchedule,
  formatTimeOfDay,
  isIsoDate,
  isOverdueTask,
  minutesBetweenDateTimes,
  parseTimeOfDay,
  shiftDateRange,
  startOfMonth,
  startOfWeekMonday,
  todayIso,
} from "@/lib/work/dates"
import type { StaffDailyLogView } from "@/lib/work/log-types"
import {
  STAFF_TASK_PRIORITIES,
  STAFF_TASK_PRIORITY_LABELS,
  STAFF_TASK_STATUSES,
  STAFF_TASK_STATUS_LABELS,
  type StaffTaskPriority,
  type StaffTaskStatus,
  type StaffTaskView,
  type WorkAssignee,
} from "@/lib/work/task-types"

export type WorkViewMode = "board" | "list" | "week" | "month" | "day"
type AssigneeFilter = "all" | "unassigned" | string

type TaskFormState = {
  title: string
  notes: string
  assigneeId: string
  status: StaffTaskStatus
  priority: StaffTaskPriority
  startsOn: string
  endsOn: string
  startTime: string
  endTime: string
}

const fieldClassName =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
const labelClassName = "mb-1.5 block text-xs font-medium text-foreground"
const selectClassName = cn(fieldClassName, "appearance-none")
const textareaClassName =
  "min-h-24 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

const COLUMN_META: Record<
  StaffTaskStatus,
  { accent: string; header: string; empty: string }
> = {
  todo: {
    accent: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
    header: "border-slate-200 dark:border-slate-800",
    empty: "No tasks waiting.",
  },
  in_progress: {
    accent: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    header: "border-sky-200 dark:border-sky-900",
    empty: "Nothing in progress.",
  },
  done: {
    accent: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    header: "border-emerald-200 dark:border-emerald-900",
    empty: "No completed tasks yet.",
  },
  blocked: {
    accent: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    header: "border-rose-200 dark:border-rose-900",
    empty: "No blocked work.",
  },
}

const PRIORITY_BADGE: Record<StaffTaskPriority, string> = {
  low: "border-0 bg-slate-500/10 text-slate-700 dark:text-slate-300",
  medium: "border-0 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  high: "border-0 bg-rose-500/10 text-rose-700 dark:text-rose-300",
}

function emptyFormState(
  startsOn = "",
  assigneeId = ""
): TaskFormState {
  return {
    title: "",
    notes: "",
    assigneeId,
    status: "todo",
    priority: "medium",
    startsOn,
    endsOn: startsOn,
    startTime: "",
    endTime: "",
  }
}

function formStateFromTask(task: StaffTaskView): TaskFormState {
  return {
    title: task.title,
    notes: task.notes,
    assigneeId: task.assigneeId ?? "",
    status: task.status,
    priority: task.priority,
    startsOn: task.startsOn ?? task.scheduledOn ?? "",
    endsOn: task.endsOn ?? task.startsOn ?? task.scheduledOn ?? "",
    startTime: parseTimeOfDay(task.startTime) ?? "",
    endTime: parseTimeOfDay(task.endTime) ?? "",
  }
}

function nextSortOrder(tasks: StaffTaskView[], status: StaffTaskStatus) {
  return (
    tasks
      .filter((task) => task.status === status)
      .reduce((max, task) => Math.max(max, task.sortOrder), 0) + 1
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: number
  icon: ComponentType<{ className?: string }>
  accent: string
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-3 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground sm:text-sm">
            {label}
          </p>
          <p className="mt-1 text-xl font-bold tracking-tight text-foreground sm:mt-2 sm:text-3xl">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg sm:size-10 sm:rounded-xl",
            accent
          )}
        >
          <Icon className="size-4 sm:size-5" aria-hidden />
        </div>
      </div>
    </div>
  )
}

function TaskFormFields({
  idPrefix,
  form,
  assignees,
  onChange,
  disabled,
  lockAssignee = false,
}: {
  idPrefix: string
  form: TaskFormState
  assignees: WorkAssignee[]
  onChange: (patch: Partial<TaskFormState>) => void
  disabled: boolean
  lockAssignee?: boolean
}) {
  const assignable = assignees.filter((member) => member.status !== "inactive")
  const selectedInactive = assignees.find(
    (member) => member.id === form.assigneeId && member.status === "inactive"
  )

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`${idPrefix}-title`} className={labelClassName}>
          Title
        </label>
        <Input
          id={`${idPrefix}-title`}
          value={form.title}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder="What needs to be done?"
          className={fieldClassName}
          disabled={disabled}
          required
        />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-notes`} className={labelClassName}>
          Notes
        </label>
        <textarea
          id={`${idPrefix}-notes`}
          value={form.notes}
          onChange={(event) => onChange({ notes: event.target.value })}
          placeholder="Optional context"
          className={textareaClassName}
          disabled={disabled}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-assignee`} className={labelClassName}>
            Assign to
          </label>
          <select
            id={`${idPrefix}-assignee`}
            value={form.assigneeId}
            onChange={(event) => onChange({ assigneeId: event.target.value })}
            className={selectClassName}
            disabled={disabled || lockAssignee}
          >
            {lockAssignee ? null : <option value="">Unassigned</option>}
            {selectedInactive ? (
              <option value={selectedInactive.id}>
                {selectedInactive.fullName} (inactive)
              </option>
            ) : null}
            {assignable.map((member) => (
              <option key={member.id} value={member.id}>
                {member.fullName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${idPrefix}-starts-on`} className={labelClassName}>
            Start date
          </label>
          <Input
            id={`${idPrefix}-starts-on`}
            type="date"
            value={form.startsOn}
            onChange={(event) => {
              const startsOn = event.target.value
              const endsOn =
                !form.endsOn || (form.startsOn && form.endsOn < startsOn)
                  ? startsOn
                  : form.endsOn
              onChange({ startsOn, endsOn })
            }}
            className={fieldClassName}
            disabled={disabled}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-start`} className={labelClassName}>
            Start time
          </label>
          <Input
            id={`${idPrefix}-start`}
            type="time"
            value={form.startTime}
            onChange={(event) => onChange({ startTime: event.target.value })}
            className={fieldClassName}
            disabled={disabled}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-ends-on`} className={labelClassName}>
            End date
          </label>
          <Input
            id={`${idPrefix}-ends-on`}
            type="date"
            value={form.endsOn}
            min={form.startsOn || undefined}
            onChange={(event) => onChange({ endsOn: event.target.value })}
            className={fieldClassName}
            disabled={disabled}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-end`} className={labelClassName}>
            End time
          </label>
          <Input
            id={`${idPrefix}-end`}
            type="time"
            value={form.endTime}
            onChange={(event) => onChange({ endTime: event.target.value })}
            className={fieldClassName}
            disabled={disabled}
          />
        </div>
        <div>
          <p className={labelClassName}>Duration</p>
          <p className="flex h-10 items-center rounded-xl border border-dashed border-border/70 px-3 text-sm text-muted-foreground">
            {form.startsOn && form.endsOn && form.startTime && form.endTime
              ? minutesBetweenDateTimes(
                  form.startsOn,
                  form.startTime,
                  form.endsOn,
                  form.endTime
                ) != null
                ? formatDurationMinutes(
                    minutesBetweenDateTimes(
                      form.startsOn,
                      form.startTime,
                      form.endsOn,
                      form.endTime
                    )
                  )
                : "End must be after start"
              : "Set start and end date and time"}
          </p>
        </div>
        <div>
          <label htmlFor={`${idPrefix}-status`} className={labelClassName}>
            Status
          </label>
          <select
            id={`${idPrefix}-status`}
            value={form.status}
            onChange={(event) =>
              onChange({ status: event.target.value as StaffTaskStatus })
            }
            className={selectClassName}
            disabled={disabled}
          >
            {STAFF_TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STAFF_TASK_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${idPrefix}-priority`} className={labelClassName}>
            Priority
          </label>
          <select
            id={`${idPrefix}-priority`}
            value={form.priority}
            onChange={(event) =>
              onChange({ priority: event.target.value as StaffTaskPriority })
            }
            className={selectClassName}
            disabled={disabled}
          >
            {STAFF_TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {STAFF_TASK_PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

function TaskCard({
  task,
  onOpen,
  onStatusChange,
}: {
  task: StaffTaskView
  onOpen: () => void
  onStatusChange: (status: StaffTaskStatus) => void
}) {
  const overdue = isOverdueTask(task)

  function handleDragStart(event: DragEvent<HTMLDivElement>) {
    event.dataTransfer.setData("text/plain", task.id)
    event.dataTransfer.effectAllowed = "move"
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="w-full cursor-grab rounded-xl border border-border/60 bg-background p-3 text-left shadow-sm transition hover:border-border hover:shadow"
    >
      <button type="button" onClick={onOpen} className="w-full text-left">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">{task.title}</p>
          <Badge className={cn("shrink-0 font-semibold", PRIORITY_BADGE[task.priority])}>
            {STAFF_TASK_PRIORITY_LABELS[task.priority]}
          </Badge>
        </div>
        {task.notes ? (
          <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
            {task.notes}
          </p>
        ) : null}
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {task.assignee ? (
              <>
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold",
                    task.assignee.accent
                  )}
                >
                  {task.assignee.initials}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {task.assignee.fullName}
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">Unassigned</span>
            )}
          </div>
          <span
            className={cn(
              "shrink-0 text-xs",
              overdue
                ? "font-medium text-rose-600 dark:text-rose-400"
                : "text-muted-foreground"
            )}
          >
            {overdue ? "Overdue · " : ""}
            {formatTaskSchedule(
              task.startsOn,
              task.startTime,
              task.endsOn,
              task.endTime
            ) ?? "No dates"}
          </span>
        </div>
      </button>
      <label className="sr-only" htmlFor={`status-${task.id}`}>
        Change status
      </label>
      <select
        id={`status-${task.id}`}
        value={task.status}
        onChange={(event) =>
          onStatusChange(event.target.value as StaffTaskStatus)
        }
        className="mt-3 h-8 w-full cursor-pointer rounded-lg border border-border bg-card px-2 text-xs outline-none"
      >
        {STAFF_TASK_STATUSES.map((status) => (
          <option key={status} value={status}>
            {STAFF_TASK_STATUS_LABELS[status]}
          </option>
        ))}
      </select>
    </div>
  )
}

export function WorkDashboard({
  tasks: initialTasks,
  assignees,
  logs: initialLogs = [],
  logsUnavailable = false,
  initialTaskId,
  initialAssigneeId,
  initialView,
  initialDate,
  accessKind = "admin",
  selfMemberId = null,
}: {
  tasks: StaffTaskView[]
  assignees: WorkAssignee[]
  logs: StaffDailyLogView[]
  logsUnavailable?: boolean
  initialTaskId?: string | null
  initialAssigneeId?: string | null
  initialView?: WorkViewMode | null
  initialDate?: string | null
  accessKind?: "admin" | "staff"
  selfMemberId?: string | null
}) {
  const router = useRouter()
  const today = todayIso()
  const isStaff = accessKind === "staff"
  const startingDate =
    initialDate && isIsoDate(initialDate) ? initialDate : today
  const [isPending, startTransition] = useTransition()
  const [tasks, setTasks] = useState(initialTasks)
  const [logs, setLogs] = useState(initialLogs ?? [])
  const [query, setQuery] = useState("")
  const [assigneeFilter, setAssigneeFilter] = useState<AssigneeFilter>(() => {
    if (isStaff && selfMemberId) return selfMemberId
    if (
      initialAssigneeId &&
      assignees.some((member) => member.id === initialAssigneeId)
    ) {
      return initialAssigneeId
    }
    return "all"
  })
  const [view, setView] = useState<WorkViewMode>(initialView ?? "board")
  const [selectedDate, setSelectedDate] = useState(startingDate)
  const [weekStart, setWeekStart] = useState(startOfWeekMonday(startingDate))
  const [dropStatus, setDropStatus] = useState<StaffTaskStatus | null>(null)
  const [dropDate, setDropDate] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState<TaskFormState>(emptyFormState)
  const [editingTask, setEditingTask] = useState<StaffTaskView | null>(() => {
    if (!initialTaskId) return null
    return initialTasks.find((task) => task.id === initialTaskId) ?? null
  })
  const [editForm, setEditForm] = useState<TaskFormState>(() => {
    if (!initialTaskId) return emptyFormState()
    const match = initialTasks.find((task) => task.id === initialTaskId)
    return match ? formStateFromTask(match) : emptyFormState()
  })
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return tasks.filter((task) => {
      if (assigneeFilter === "unassigned" && task.assigneeId) return false
      if (
        assigneeFilter !== "all" &&
        assigneeFilter !== "unassigned" &&
        task.assigneeId !== assigneeFilter
      ) {
        return false
      }
      if (!needle) return true
      const haystack = [
        task.title,
        task.notes,
        task.assignee?.fullName,
        STAFF_TASK_STATUS_LABELS[task.status],
        STAFF_TASK_PRIORITY_LABELS[task.priority],
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(needle)
    })
  }, [tasks, query, assigneeFilter])

  const counts = useMemo(() => {
    return {
      all: tasks.length,
      todo: tasks.filter((task) => task.status === "todo").length,
      in_progress: tasks.filter((task) => task.status === "in_progress").length,
      blocked: tasks.filter((task) => task.status === "blocked").length,
      done: tasks.filter((task) => task.status === "done").length,
    }
  }, [tasks])

  const assignableAssignees = useMemo(
    () =>
      [...assignees].sort((a, b) => {
        if (a.status === "inactive" && b.status !== "inactive") return 1
        if (a.status !== "inactive" && b.status === "inactive") return -1
        return a.fullName.localeCompare(b.fullName)
      }),
    [assignees]
  )

  const selectedMember =
    isStaff && selfMemberId
      ? (assignees.find((member) => member.id === selfMemberId) ?? null)
      : assigneeFilter !== "all" && assigneeFilter !== "unassigned"
        ? (assignees.find((member) => member.id === assigneeFilter) ?? null)
        : null

  const currentLog =
    selectedMember == null
      ? null
      : (logs.find(
          (log) =>
            log.memberId === selectedMember.id && log.logDate === selectedDate
        ) ?? null)

  const logsForSelectedDate = logs.filter((log) => log.logDate === selectedDate)

  const pulseItems = useMemo(
    () => buildWorkPulse(assignees, tasks, logs, today),
    [assignees, tasks, logs, today]
  )

  function refresh() {
    startTransition(() => {
      router.refresh()
    })
  }

  function upsertTask(task: StaffTaskView) {
    setTasks((current) => {
      const exists = current.some((item) => item.id === task.id)
      if (!exists) return [...current, task]
      return current.map((item) => (item.id === task.id ? task : item))
    })
  }

  function upsertLog(log: StaffDailyLogView) {
    setLogs((current) => {
      const without = current.filter(
        (item) =>
          item.id !== log.id &&
          !(item.memberId === log.memberId && item.logDate === log.logDate)
      )
      return [log, ...without]
    })
  }

  function openCreate() {
    const assigneeId = isStaff
      ? (selfMemberId ?? "")
      : assigneeFilter !== "all" && assigneeFilter !== "unassigned"
        ? assigneeFilter
        : ""
    const startsOn =
      view === "week" || view === "day" || view === "month" ? selectedDate : ""
    setCreateForm(emptyFormState(startsOn, assigneeId))
    setCreateOpen(true)
  }

  function goToDay(iso: string) {
    setSelectedDate(iso)
    setWeekStart(startOfWeekMonday(iso))
    setView("day")
  }

  async function readTaskPayload(response: Response) {
    const payload = (await response.json().catch(() => null)) as {
      task?: StaffTaskView
      error?: string
    } | null
    return payload
  }

  async function createTask(event: FormEvent) {
    event.preventDefault()
    if (!createForm.title.trim()) {
      notify.error("Title is required.")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/admin/staff-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: createForm.title,
          notes: createForm.notes,
          assignee_id: createForm.assigneeId || null,
          status: createForm.status,
          priority: createForm.priority,
          starts_on: createForm.startsOn || null,
          ends_on: createForm.endsOn || createForm.startsOn || null,
          start_time: createForm.startTime || null,
          end_time: createForm.endTime || null,
          sort_order: nextSortOrder(tasks, createForm.status),
        }),
      })

      const payload = await readTaskPayload(response)
      if (!response.ok) {
        notify.error(payload?.error ?? "Unable to create task.")
        return
      }

      if (payload?.task) upsertTask(payload.task)
      notify.success("Task created.")
      setCreateOpen(false)
      setCreateForm(emptyFormState("", isStaff ? (selfMemberId ?? "") : ""))
      refresh()
    } finally {
      setSaving(false)
    }
  }

  async function saveTask(event: FormEvent) {
    event.preventDefault()
    if (!editingTask || confirmDelete) return
    if (!editForm.title.trim()) {
      notify.error("Title is required.")
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/staff-tasks/${editingTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title,
          notes: editForm.notes,
          assignee_id: editForm.assigneeId || null,
          status: editForm.status,
          priority: editForm.priority,
          starts_on: editForm.startsOn || null,
          ends_on: editForm.endsOn || editForm.startsOn || null,
          start_time: editForm.startTime || null,
          end_time: editForm.endTime || null,
        }),
      })

      const payload = await readTaskPayload(response)
      if (!response.ok) {
        notify.error(payload?.error ?? "Unable to update task.")
        return
      }

      if (payload?.task) upsertTask(payload.task)
      notify.success("Task updated.")
      setEditingTask(null)
      setConfirmDelete(false)
      refresh()
    } finally {
      setSaving(false)
    }
  }

  async function updateStatus(taskId: string, status: StaffTaskStatus) {
    const current = tasks.find((task) => task.id === taskId)
    if (!current || current.status === status) return

    const previous = tasks
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? { ...task, status, sortOrder: nextSortOrder(currentTasks, status) }
          : task
      )
    )

    const response = await fetch(`/api/admin/staff-tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        sort_order: nextSortOrder(previous, status),
      }),
    })

    const payload = await readTaskPayload(response)
    if (!response.ok) {
      setTasks(previous)
      notify.error(payload?.error ?? "Unable to update status.")
      return
    }

    if (payload?.task) upsertTask(payload.task)
    refresh()
  }

  async function deleteTask() {
    if (!editingTask) return
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/staff-tasks/${editingTask.id}`, {
        method: "DELETE",
      })

      const payload = await readTaskPayload(response)
      if (!response.ok) {
        notify.error(payload?.error ?? "Unable to delete task.")
        return
      }

      setTasks((current) =>
        current.filter((task) => task.id !== editingTask.id)
      )
      notify.success("Task deleted.")
      setEditingTask(null)
      setConfirmDelete(false)
      refresh()
    } finally {
      setSaving(false)
    }
  }

  function handleDrop(status: StaffTaskStatus, event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDropStatus(null)
    const taskId = event.dataTransfer.getData("text/plain")
    if (!taskId) return
    void updateStatus(taskId, status)
  }

  async function rescheduleTask(taskId: string, startsOn: string) {
    const current = tasks.find((task) => task.id === taskId)
    if (!current) return
    const next = shiftDateRange(current.startsOn, current.endsOn, startsOn)
    if (current.startsOn === next.startsOn && current.endsOn === next.endsOn) {
      return
    }

    const previous = tasks
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              startsOn: next.startsOn,
              endsOn: next.endsOn,
              scheduledOn: next.startsOn,
            }
          : task
      )
    )

    const response = await fetch(`/api/admin/staff-tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        starts_on: next.startsOn,
        ends_on: next.endsOn,
        start_time: current.startTime,
        end_time: current.endTime,
      }),
    })
    const payload = await readTaskPayload(response)

    if (!response.ok) {
      setTasks(previous)
      notify.error(payload?.error ?? "Unable to reschedule task.")
      return
    }

    if (payload?.task) upsertTask(payload.task)
    refresh()
  }

  function handleDateDrop(iso: string, event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDropDate(null)
    const taskId = event.dataTransfer.getData("text/plain")
    if (!taskId) return
    void rescheduleTask(taskId, iso)
  }

  async function saveLog(summary: string, hoursSpent: string) {
    if (!selectedMember) {
      notify.error("Select a team member to save a log.")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/admin/staff-daily-logs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: selectedMember.id,
          log_date: selectedDate,
          summary,
          hours_spent: hoursSpent.trim() ? hoursSpent : null,
        }),
      })
      const payload = (await response.json().catch(() => null)) as {
        log?: StaffDailyLogView
        error?: string
      } | null

      if (!response.ok) {
        notify.error(payload?.error ?? "Unable to save daily log.")
        return
      }

      if (payload?.log) upsertLog(payload.log)
      notify.success("Daily log saved.")
      refresh()
    } finally {
      setSaving(false)
    }
  }

  async function clearLog() {
    if (!currentLog) return
    setSaving(true)
    try {
      const response = await fetch(
        `/api/admin/staff-daily-logs/${currentLog.id}`,
        { method: "DELETE" }
      )
      const payload = (await response.json().catch(() => null)) as {
        error?: string
      } | null

      if (!response.ok) {
        notify.error(payload?.error ?? "Unable to clear daily log.")
        return
      }

      setLogs((current) => current.filter((log) => log.id !== currentLog.id))
      notify.success("Daily log cleared.")
      refresh()
    } finally {
      setSaving(false)
    }
  }

  function openEdit(task: StaffTaskView) {
    setConfirmDelete(false)
    setEditingTask(task)
    setEditForm(formStateFromTask(task))
  }

  const busy = saving || isPending

  return (
    <div className="min-w-0 space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            Tasks
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            {isStaff ? "My tasks" : "Tasks"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isStaff
              ? "Your assigned tasks — create work, update status, and log your day."
              : "Internal staff tasks — assign work, review the calendar, and log what got done."}
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreate}
          className="h-11 shrink-0 gap-2 rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
        >
          <Plus className="size-4" aria-hidden />
          New task
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="To do"
          value={counts.todo}
          icon={CircleDashed}
          accent="bg-slate-500/10 text-slate-600"
        />
        <StatCard
          label="In progress"
          value={counts.in_progress}
          icon={Timer}
          accent="bg-sky-500/10 text-sky-600"
        />
        <StatCard
          label="Blocked"
          value={counts.blocked}
          icon={AlertCircle}
          accent="bg-rose-500/10 text-rose-600"
        />
        <StatCard
          label="Done"
          value={counts.done}
          icon={CheckCircle2}
          accent="bg-emerald-500/10 text-emerald-600"
        />
      </div>

      {isStaff ? null : (
        <WorkPulse
          items={pulseItems}
          logsUnavailable={logsUnavailable}
          onSelectMember={(memberId) => {
            setAssigneeFilter(memberId)
            goToDay(today)
          }}
        />
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tasks"
            className="h-11 rounded-xl pl-9"
          />
        </div>
        {isStaff ? null : (
          <select
            value={assigneeFilter}
            onChange={(event) =>
              setAssigneeFilter(event.target.value as AssigneeFilter)
            }
            className={cn(selectClassName, "h-11 lg:w-64")}
            aria-label="Filter by team member"
          >
            <option value="all">All team members</option>
            <option value="unassigned">Unassigned</option>
            {assignableAssignees.map((member) => (
              <option key={member.id} value={member.id}>
                {member.fullName}
                {member.status === "inactive" ? " (inactive)" : ""}
              </option>
            ))}
          </select>
        )}
        <div className="flex flex-wrap rounded-xl border border-border/60 bg-card p-1">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setView("board")}
            className={cn(
              "h-9 flex-1 gap-2 rounded-lg",
              view === "board" && "bg-muted"
            )}
          >
            <LayoutGrid className="size-4" aria-hidden />
            Board
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setView("list")}
            className={cn(
              "h-9 flex-1 gap-2 rounded-lg",
              view === "list" && "bg-muted"
            )}
          >
            <List className="size-4" aria-hidden />
            List
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setWeekStart(startOfWeekMonday(selectedDate))
              setView("week")
            }}
            className={cn(
              "h-9 flex-1 gap-2 rounded-lg",
              view === "week" && "bg-muted"
            )}
          >
            <CalendarRange className="size-4" aria-hidden />
            Week
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setView("month")}
            className={cn(
              "h-9 flex-1 gap-2 rounded-lg",
              view === "month" && "bg-muted"
            )}
          >
            <Calendar className="size-4" aria-hidden />
            Month
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setView("day")}
            className={cn(
              "h-9 flex-1 gap-2 rounded-lg",
              view === "day" && "bg-muted"
            )}
          >
            <CalendarDays className="size-4" aria-hidden />
            Day
          </Button>
        </div>
      </div>

      {view === "board" ? (
        <div className="grid auto-cols-[minmax(16.5rem,1fr)] grid-flow-col gap-4 overflow-x-auto pb-2 lg:auto-cols-fr lg:grid-flow-row lg:grid-cols-4">
          {STAFF_TASK_STATUSES.map((status) => {
            const columnTasks = filtered.filter((task) => task.status === status)
            return (
              <div
                key={status}
                onDragOver={(event) => {
                  event.preventDefault()
                  event.dataTransfer.dropEffect = "move"
                  setDropStatus(status)
                }}
                onDragLeave={() => {
                  setDropStatus((current) => (current === status ? null : current))
                }}
                onDrop={(event) => handleDrop(status, event)}
                className={cn(
                  "flex min-h-72 flex-col rounded-2xl border bg-muted/30 p-3",
                  COLUMN_META[status].header,
                  dropStatus === status && "ring-2 ring-brand/40"
                )}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-foreground">
                    {STAFF_TASK_STATUS_LABELS[status]}
                  </h2>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      COLUMN_META[status].accent
                    )}
                  >
                    {columnTasks.length}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  {columnTasks.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border/70 px-3 py-8 text-center text-xs text-muted-foreground">
                      {COLUMN_META[status].empty}
                    </p>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onOpen={() => openEdit(task)}
                        onStatusChange={(nextStatus) =>
                          void updateStatus(task.id, nextStatus)
                        }
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
      {view === "list" ? (
        <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border/60 text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Task</th>
                <th className="px-4 py-3 font-semibold">Assignee</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">Start</th>
                <th className="px-4 py-3 font-semibold">End</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    No tasks match these filters.
                  </td>
                </tr>
              ) : (
                filtered.map((task) => (
                  <tr
                    key={task.id}
                    className="cursor-pointer border-b border-border/40 last:border-0 hover:bg-muted/40"
                    onClick={() => openEdit(task)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{task.title}</p>
                      {task.notes ? (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {task.notes}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {task.assignee?.fullName ?? "Unassigned"}
                    </td>
                    <td className="px-4 py-3">
                      {STAFF_TASK_STATUS_LABELS[task.status]}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={PRIORITY_BADGE[task.priority]}>
                        {STAFF_TASK_PRIORITY_LABELS[task.priority]}
                      </Badge>
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3",
                        isOverdueTask(task)
                          ? "font-medium text-rose-600 dark:text-rose-400"
                          : "text-muted-foreground"
                      )}
                    >
                      {task.startsOn
                        ? [
                            formatTaskDate(task.startsOn),
                            task.startTime ? formatTimeOfDay(task.startTime) : "",
                          ]
                            .filter(Boolean)
                            .join(" · ")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {task.endsOn
                        ? [
                            formatTaskDate(task.endsOn),
                            task.endTime ? formatTimeOfDay(task.endTime) : "",
                          ]
                            .filter(Boolean)
                            .join(" · ")
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : view === "week" ? (
        <WorkWeekView
          weekStart={weekStart}
          selectedDate={selectedDate}
          today={today}
          tasks={filtered}
          logs={logs}
          dropDate={dropDate}
          onPrevWeek={() => setWeekStart(addDaysIso(weekStart, -7))}
          onNextWeek={() => setWeekStart(addDaysIso(weekStart, 7))}
          onThisWeek={() => {
            setSelectedDate(today)
            setWeekStart(startOfWeekMonday(today))
          }}
          onSelectDay={goToDay}
          onOpenTask={openEdit}
          onDragOverDay={setDropDate}
          onDropOnDay={handleDateDrop}
        />
      ) : view === "month" ? (
        <WorkMonthView
          monthStart={startOfMonth(selectedDate)}
          selectedDate={selectedDate}
          today={today}
          tasks={filtered}
          onPrevMonth={() => {
            const next = addMonthsIso(selectedDate, -1)
            setSelectedDate(next)
            setWeekStart(startOfWeekMonday(next))
          }}
          onNextMonth={() => {
            const next = addMonthsIso(selectedDate, 1)
            setSelectedDate(next)
            setWeekStart(startOfWeekMonday(next))
          }}
          onThisMonth={() => {
            setSelectedDate(today)
            setWeekStart(startOfWeekMonday(today))
          }}
          onSelectDay={goToDay}
          onOpenTask={openEdit}
        />
      ) : view === "day" ? (
        <WorkDayView
          key={`${selectedDate}-${selectedMember?.id ?? "all"}`}
          date={selectedDate}
          today={today}
          tasks={filtered}
          member={selectedMember}
          log={currentLog}
          logsForDate={logsForSelectedDate}
          logsUnavailable={logsUnavailable}
          saving={saving}
          onDateChange={(iso) => {
            if (!isIsoDate(iso)) return
            setSelectedDate(iso)
            setWeekStart(startOfWeekMonday(iso))
          }}
          onPrevDay={() => {
            const next = addDaysIso(selectedDate, -1)
            setSelectedDate(next)
            setWeekStart(startOfWeekMonday(next))
          }}
          onNextDay={() => {
            const next = addDaysIso(selectedDate, 1)
            setSelectedDate(next)
            setWeekStart(startOfWeekMonday(next))
          }}
          onToday={() => {
            setSelectedDate(today)
            setWeekStart(startOfWeekMonday(today))
          }}
          onOpenTask={openEdit}
          onStatusChange={(taskId, status) => void updateStatus(taskId, status)}
          onSaveLog={(summary, hoursSpent) => void saveLog(summary, hoursSpent)}
          onClearLog={() => void clearLog()}
          onAddTask={openCreate}
        />
      ) : null}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <form onSubmit={createTask}>
            <DialogHeader>
              <DialogTitle>New task</DialogTitle>
              <DialogDescription>
                {isStaff
                  ? "Create a task on your board."
                  : "Create an internal staff task and assign it to a team member."}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <TaskFormFields
                idPrefix="create-task"
                form={createForm}
                assignees={assignees}
                onChange={(patch) =>
                  setCreateForm((current) => ({ ...current, ...patch }))
                }
                disabled={busy}
                lockAssignee={isStaff}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                disabled={busy}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={busy}
                className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : null}
                Create task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingTask)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingTask(null)
            setConfirmDelete(false)
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <form onSubmit={saveTask}>
            <DialogHeader>
              <DialogTitle>Edit task</DialogTitle>
              <DialogDescription>
                Update assignment, status, or schedule for this staff task.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {editingTask ? (
                <TaskFormFields
                  idPrefix="edit-task"
                  form={editForm}
                  assignees={assignees}
                  onChange={(patch) =>
                    setEditForm((current) => ({ ...current, ...patch }))
                  }
                  disabled={busy}
                  lockAssignee={isStaff}
                />
              ) : null}
              {confirmDelete ? (
                <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                  Delete this task? This cannot be undone.
                </p>
              ) : null}
            </div>
            <DialogFooter className="gap-2 sm:justify-between">
              {confirmDelete ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setConfirmDelete(false)}
                    disabled={busy}
                    className="rounded-xl"
                  >
                    Keep task
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => void deleteTask()}
                    disabled={busy}
                    className="rounded-xl"
                  >
                    {saving ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : null}
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setConfirmDelete(true)}
                    disabled={busy}
                    className="rounded-xl text-rose-600 hover:text-rose-700"
                  >
                    Delete
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingTask(null)
                        setConfirmDelete(false)
                      }}
                      disabled={busy}
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={busy}
                      className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
                    >
                      {saving ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                      ) : null}
                      Save changes
                    </Button>
                  </div>
                </>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
