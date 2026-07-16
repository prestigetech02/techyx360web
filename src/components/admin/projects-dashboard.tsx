"use client"

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ComponentType,
  type FormEvent,
} from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  FolderKanban,
  Grid2X2,
  List,
  MoreVertical,
  Pause,
  Play,
  Plus,
  Search,
  Trash2,
  Users,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type {
  ProjectClientOption,
  ProjectPriorityLabel,
  ProjectStatusLabel,
  ProjectView,
} from "@/lib/crm/project-types"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

type DetailTab = "overview" | "milestones" | "tasks" | "team"
type StatusFilter = "all" | ProjectStatusLabel

type ProjectsDashboardProps = {
  projects: ProjectView[]
  clients: ProjectClientOption[]
  initialProjectId?: string | null
  initialClientId?: string | null
}

const filters: Array<{ label: string; value: StatusFilter }> = [
  { label: "All Projects", value: "all" },
  { label: "In Progress", value: "In Progress" },
  { label: "On Hold", value: "On Hold" },
  { label: "Completed", value: "Completed" },
  { label: "Overdue", value: "Overdue" },
]

const detailTabs: Array<{ value: DetailTab; label: string }> = [
  { value: "overview", label: "Overview" },
  { value: "milestones", label: "Milestones" },
  { value: "tasks", label: "Tasks" },
  { value: "team", label: "Team" },
]

const statusStyles: Record<ProjectStatusLabel, string> = {
  "In Progress": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  "On Hold": "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Overdue: "bg-red-500/10 text-red-700 dark:text-red-400",
}

const progressStyles: Record<ProjectStatusLabel, string> = {
  "In Progress": "bg-blue-600",
  "On Hold": "bg-amber-500",
  Completed: "bg-emerald-500",
  Overdue: "bg-red-500",
}

const fieldClassName =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
const labelClassName = "mb-1.5 block text-xs font-medium text-foreground"
const selectClassName = cn(fieldClassName, "appearance-none")
const textareaClassName = cn(
  fieldClassName,
  "min-h-[96px] resize-y py-2.5 leading-relaxed"
)

async function readError(response: Response) {
  const data = (await response.json().catch(() => null)) as {
    error?: string
  } | null
  return data?.error ?? "Something went wrong."
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
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-4">
        <span
          className={cn(
            "inline-flex size-12 shrink-0 items-center justify-center rounded-full",
            accent
          )}
        >
          <Icon className="size-6" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  )
}

function TeamAvatars({ members }: { members: string[] }) {
  const visible = members.slice(0, 4)
  const remainder = members.length - visible.length

  return (
    <div className="flex items-center">
      {visible.map((member, index) => (
        <span
          key={`${member}-${index}`}
          className="-ml-1.5 inline-flex size-7 items-center justify-center rounded-full border-2 border-card bg-slate-700 text-[9px] font-bold text-white first:ml-0"
          title={member}
        >
          {member}
        </span>
      ))}
      {remainder > 0 ? (
        <span className="-ml-1.5 inline-flex size-7 items-center justify-center rounded-full border-2 border-card bg-blue-50 text-[9px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          +{remainder}
        </span>
      ) : null}
    </div>
  )
}

function ProjectProgress({
  progress,
  status,
}: {
  progress: number
  status: ProjectStatusLabel
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground">{progress}%</span>
        <span className="text-muted-foreground">{progress}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", progressStyles[status])}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

function ProjectDetailContent({
  project,
  clients,
  isPending,
  onProjectChange,
  onDelete,
}: {
  project: ProjectView
  clients: ProjectClientOption[]
  isPending: boolean
  onProjectChange: (project: ProjectView) => void
  onDelete: () => void
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview")
  const [updateOpen, setUpdateOpen] = useState(false)
  const [milestoneOpen, setMilestoneOpen] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)

  const [name, setName] = useState(project.name)
  const [category, setCategory] = useState(project.category)
  const [clientId, setClientId] = useState(project.clientId ?? "")
  const [description, setDescription] = useState(project.description)
  const [status, setStatus] = useState<ProjectStatusLabel>(project.status)
  const [priority, setPriority] = useState<ProjectPriorityLabel>(
    project.priority
  )
  const [progress, setProgress] = useState(String(project.progress))
  const [startDate, setStartDate] = useState(project.startDateIso ?? "")
  const [dueDate, setDueDate] = useState(project.dueDateIso ?? "")
  const [teamInput, setTeamInput] = useState(project.team.join(", "))

  const [milestoneTitle, setMilestoneTitle] = useState("")
  const [milestoneDate, setMilestoneDate] = useState("")
  const [taskTitle, setTaskTitle] = useState("")
  const [taskAssignee, setTaskAssignee] = useState("")

  const completedTasks = project.tasks.filter((task) => task.done).length
  const completedMilestones = project.milestones.filter(
    (milestone) => milestone.done
  ).length

  function openUpdateDialog() {
    setName(project.name)
    setCategory(project.category)
    setClientId(project.clientId ?? "")
    setDescription(project.description)
    setStatus(project.status)
    setPriority(project.priority)
    setProgress(String(project.progress))
    setStartDate(project.startDateIso ?? "")
    setDueDate(project.dueDateIso ?? "")
    setTeamInput(project.team.join(", "))
    setUpdateOpen(true)
  }

  async function saveProject(event: FormEvent) {
    event.preventDefault()
    const nextProgress = Number(progress)
    if (Number.isNaN(nextProgress) || nextProgress < 0 || nextProgress > 100) {
      notify.error("Progress must be between 0 and 100.")
      return
    }
    if (!clientId) {
      notify.error("Select a client.")
      return
    }

    const response = await fetch(`/api/admin/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        category,
        client_id: clientId,
        description,
        status,
        priority,
        progress: nextProgress,
        start_date: startDate || null,
        due_date: dueDate || null,
        team_initials: teamInput,
      }),
    })

    if (!response.ok) {
      notify.error(await readError(response))
      return
    }

    const data = (await response.json()) as { project: ProjectView }
    onProjectChange(data.project)
    setUpdateOpen(false)
    notify.success("Project updated.")
  }

  async function toggleMilestone(id: string, done: boolean) {
    const response = await fetch(
      `/api/admin/projects/${project.id}/milestones/${id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !done }),
      }
    )

    if (!response.ok) {
      notify.error(await readError(response))
      return
    }

    const data = (await response.json()) as { project: ProjectView }
    onProjectChange(data.project)
  }

  async function toggleTask(id: string, done: boolean) {
    const response = await fetch(
      `/api/admin/projects/${project.id}/tasks/${id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !done }),
      }
    )

    if (!response.ok) {
      notify.error(await readError(response))
      return
    }

    const data = (await response.json()) as { project: ProjectView }
    onProjectChange(data.project)
  }

  function resetMilestoneForm() {
    setMilestoneTitle("")
    setMilestoneDate("")
  }

  function resetTaskForm() {
    setTaskTitle("")
    setTaskAssignee("")
  }

  async function addMilestone(event: FormEvent) {
    event.preventDefault()
    const response = await fetch(
      `/api/admin/projects/${project.id}/milestones`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: milestoneTitle,
          due_date: milestoneDate || null,
        }),
      }
    )

    if (!response.ok) {
      notify.error(await readError(response))
      return
    }

    const data = (await response.json()) as { project: ProjectView }
    onProjectChange(data.project)
    setMilestoneOpen(false)
    resetMilestoneForm()
    notify.success("Milestone added.")
  }

  async function addTask(event: FormEvent) {
    event.preventDefault()
    const response = await fetch(`/api/admin/projects/${project.id}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: taskTitle,
        assignee: taskAssignee,
      }),
    })

    if (!response.ok) {
      notify.error(await readError(response))
      return
    }

    const data = (await response.json()) as { project: ProjectView }
    onProjectChange(data.project)
    setTaskOpen(false)
    resetTaskForm()
    notify.success("Task added.")
  }

  return (
    <>
      <SheetHeader className="shrink-0 space-y-0 border-b border-border/60 p-5 pr-12 text-left">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
              project.accent
            )}
          >
            {project.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <SheetTitle className="text-base font-bold text-foreground">
                {project.name}
              </SheetTitle>
              <Badge
                className={cn("border-0 font-medium", statusStyles[project.status])}
              >
                {project.status}
              </Badge>
            </div>
            <SheetDescription className="mt-1">
              {project.category}
            </SheetDescription>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building2 className="size-3.5 shrink-0 text-brand" aria-hidden />
              {project.client}
            </p>
          </div>
        </div>
      </SheetHeader>

      <div className="shrink-0 overflow-x-auto border-b border-border/60 px-5">
        <div className="flex min-w-max gap-1">
          {detailTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "shrink-0 border-b-2 px-3 py-3 text-sm font-semibold transition-colors",
                activeTab === tab.value
                  ? "border-brand text-brand"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5">
        {activeTab === "overview" ? (
          <>
            <section>
              <h3 className="text-sm font-bold text-foreground">Summary</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {project.description || "No description yet."}
              </p>
            </section>

            <section className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Progress</p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {project.progress}%
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Priority</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {project.priority}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Start date</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {project.startDate}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Due date</p>
                <p
                  className={cn(
                    "mt-1 text-sm font-semibold",
                    project.overdue ? "text-red-600" : "text-foreground"
                  )}
                >
                  {project.dueDate}
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-foreground">Progress</h3>
              <div className="mt-3">
                <ProjectProgress
                  progress={project.progress}
                  status={project.status}
                />
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/60 p-3">
                <p className="text-xs text-muted-foreground">Milestones</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {completedMilestones}/{project.milestones.length} done
                </p>
              </div>
              <div className="rounded-xl border border-border/60 p-3">
                <p className="text-xs text-muted-foreground">Tasks</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {completedTasks}/{project.tasks.length} done
                </p>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                onClick={openUpdateDialog}
                disabled={isPending}
                className="h-11 rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
              >
                Update project
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onDelete}
                disabled={isPending}
                className="h-11 gap-2 rounded-xl text-red-600 hover:text-red-600"
              >
                <Trash2 className="size-4" aria-hidden />
                Delete
              </Button>
            </div>
          </>
        ) : null}

        {activeTab === "milestones" ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-foreground">Milestones</h3>
              <Button
                type="button"
                onClick={() => setMilestoneOpen(true)}
                disabled={isPending}
                className="h-9 gap-1.5 rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
              >
                <Plus className="size-4" aria-hidden />
                Add milestone
              </Button>
            </div>

            <div className="space-y-3">
              {project.milestones.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No milestones yet.
                </p>
              ) : (
                project.milestones.map((milestone) => (
                  <button
                    key={milestone.id}
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      void toggleMilestone(milestone.id, milestone.done)
                    }
                    className="flex w-full items-start gap-3 rounded-xl border border-border/60 p-3 text-left transition-colors hover:bg-muted/40 disabled:opacity-50"
                  >
                    <CheckCircle2
                      className={cn(
                        "mt-0.5 size-4 shrink-0",
                        milestone.done
                          ? "text-emerald-600"
                          : "text-muted-foreground/50"
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {milestone.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {milestone.date}
                      </p>
                    </div>
                    <Badge
                      className={cn(
                        "border-0",
                        milestone.done
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {milestone.done ? "Done" : "Pending"}
                    </Badge>
                  </button>
                ))
              )}
            </div>
          </section>
        ) : null}

        {activeTab === "tasks" ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-foreground">Tasks</h3>
              <Button
                type="button"
                onClick={() => setTaskOpen(true)}
                disabled={isPending}
                className="h-9 gap-1.5 rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
              >
                <Plus className="size-4" aria-hidden />
                Add task
              </Button>
            </div>

            <div className="space-y-3">
              {project.tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks yet.</p>
              ) : (
                project.tasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    disabled={isPending}
                    onClick={() => void toggleTask(task.id, task.done)}
                    className="flex w-full items-start gap-3 rounded-xl border border-border/60 p-3 text-left transition-colors hover:bg-muted/40 disabled:opacity-50"
                  >
                    <CheckCircle2
                      className={cn(
                        "mt-0.5 size-4 shrink-0",
                        task.done
                          ? "text-emerald-600"
                          : "text-muted-foreground/50"
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {task.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Assignee: {task.assignee}
                      </p>
                    </div>
                    <Badge
                      className={cn(
                        "border-0",
                        task.done
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {task.done ? "Done" : "Open"}
                    </Badge>
                  </button>
                ))
              )}
            </div>
          </section>
        ) : null}

        {activeTab === "team" ? (
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="size-4 text-brand" aria-hidden />
              {project.team.length} team members
            </div>
            {project.team.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No team members yet. Add initials via Update project.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {project.team.map((member) => (
                  <div
                    key={member}
                    className="flex items-center gap-3 rounded-xl border border-border/60 p-3"
                  >
                    <span className="inline-flex size-9 items-center justify-center rounded-full bg-slate-700 text-[11px] font-bold text-white">
                      {member}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {member}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Team member
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </div>

      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update project</DialogTitle>
            <DialogDescription>
              Edit details for {project.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => void saveProject(event)} className="space-y-3">
            <div>
              <label htmlFor="project-name" className={labelClassName}>
                Name
              </label>
              <Input
                id="project-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={fieldClassName}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="project-category" className={labelClassName}>
                  Category
                </label>
                <Input
                  id="project-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="project-client" className={labelClassName}>
                  Client
                </label>
                <select
                  id="project-client"
                  value={clientId}
                  onChange={(event) => setClientId(event.target.value)}
                  className={selectClassName}
                  required
                >
                  <option value="">Select client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.company}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="project-description" className={labelClassName}>
                Summary
              </label>
              <textarea
                id="project-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className={textareaClassName}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="project-status" className={labelClassName}>
                  Status
                </label>
                <select
                  id="project-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as ProjectStatusLabel)
                  }
                  className={selectClassName}
                >
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
              <div>
                <label htmlFor="project-priority" className={labelClassName}>
                  Priority
                </label>
                <select
                  id="project-priority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value as ProjectPriorityLabel)
                  }
                  className={selectClassName}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="project-progress" className={labelClassName}>
                Progress (%)
              </label>
              <Input
                id="project-progress"
                type="number"
                min={0}
                max={100}
                value={progress}
                onChange={(event) => setProgress(event.target.value)}
                className={fieldClassName}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="project-start" className={labelClassName}>
                  Start date
                </label>
                <Input
                  id="project-start"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="project-due" className={labelClassName}>
                  Due date
                </label>
                <Input
                  id="project-due"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className={fieldClassName}
                />
              </div>
            </div>
            <div>
              <label htmlFor="project-team" className={labelClassName}>
                Team initials
              </label>
              <Input
                id="project-team"
                value={teamInput}
                onChange={(event) => setTeamInput(event.target.value)}
                placeholder="KA, CM, TO"
                className={fieldClassName}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUpdateOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
              >
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={milestoneOpen}
        onOpenChange={(open) => {
          setMilestoneOpen(open)
          if (!open) resetMilestoneForm()
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add milestone</DialogTitle>
            <DialogDescription>
              Create a new milestone for {project.name}.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => void addMilestone(event)}
            className="space-y-3"
          >
            <div>
              <label htmlFor="milestone-title" className={labelClassName}>
                Title
              </label>
              <Input
                id="milestone-title"
                value={milestoneTitle}
                onChange={(event) => setMilestoneTitle(event.target.value)}
                placeholder="e.g. Design review"
                className={fieldClassName}
                required
              />
            </div>
            <div>
              <label htmlFor="milestone-date" className={labelClassName}>
                Date
              </label>
              <Input
                id="milestone-date"
                type="date"
                value={milestoneDate}
                onChange={(event) => setMilestoneDate(event.target.value)}
                className={fieldClassName}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMilestoneOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
              >
                Add milestone
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={taskOpen}
        onOpenChange={(open) => {
          setTaskOpen(open)
          if (!open) resetTaskForm()
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add task</DialogTitle>
            <DialogDescription>
              Create a new task for {project.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => void addTask(event)} className="space-y-3">
            <div>
              <label htmlFor="task-title" className={labelClassName}>
                Title
              </label>
              <Input
                id="task-title"
                value={taskTitle}
                onChange={(event) => setTaskTitle(event.target.value)}
                placeholder="e.g. Review API docs"
                className={fieldClassName}
                required
              />
            </div>
            <div>
              <label htmlFor="task-assignee" className={labelClassName}>
                Assignee
              </label>
              <Input
                id="task-assignee"
                value={taskAssignee}
                onChange={(event) => setTaskAssignee(event.target.value)}
                placeholder="e.g. CM"
                className={fieldClassName}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTaskOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
              >
                Add task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function ProjectsDashboard({
  projects: initialProjects,
  clients,
  initialProjectId = null,
  initialClientId = null,
}: ProjectsDashboardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [projects, setProjects] = useState(initialProjects)
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all")
  const [query, setQuery] = useState("")
  const [view, setView] = useState<"list" | "grid">("list")
  const [selectedProject, setSelectedProject] = useState<ProjectView | null>(
    null
  )
  const [createOpen, setCreateOpen] = useState(Boolean(initialClientId))
  const [deleteTarget, setDeleteTarget] = useState<ProjectView | null>(null)

  const [createName, setCreateName] = useState("")
  const [createCategory, setCreateCategory] = useState("Web Application")
  const [createClientId, setCreateClientId] = useState(initialClientId ?? "")
  const [createDescription, setCreateDescription] = useState("")
  const [createStatus, setCreateStatus] =
    useState<ProjectStatusLabel>("In Progress")
  const [createPriority, setCreatePriority] =
    useState<ProjectPriorityLabel>("Medium")
  const [createProgress, setCreateProgress] = useState("0")
  const [createStartDate, setCreateStartDate] = useState("")
  const [createDueDate, setCreateDueDate] = useState("")
  const [createTeam, setCreateTeam] = useState("")

  useEffect(() => {
    setProjects(initialProjects)
  }, [initialProjects])

  useEffect(() => {
    if (!initialProjectId) return
    const match = initialProjects.find(
      (project) => project.id === initialProjectId
    )
    if (match) setSelectedProject(match)
  }, [initialProjectId, initialProjects])

  const counts = useMemo(
    () => ({
      all: projects.length,
      "In Progress": projects.filter(
        (project) => project.status === "In Progress"
      ).length,
      "On Hold": projects.filter((project) => project.status === "On Hold")
        .length,
      Completed: projects.filter((project) => project.status === "Completed")
        .length,
      Overdue: projects.filter((project) => project.status === "Overdue")
        .length,
    }),
    [projects]
  )

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return projects.filter((project) => {
      const statusMatch =
        activeFilter === "all" || project.status === activeFilter
      const searchMatch =
        !normalizedQuery ||
        [project.name, project.client, project.category].some((value) =>
          value.toLowerCase().includes(normalizedQuery)
        )

      return statusMatch && searchMatch
    })
  }, [activeFilter, projects, query])

  function refresh() {
    startTransition(() => {
      router.refresh()
    })
  }

  function applyProject(next: ProjectView) {
    setProjects((current) =>
      current.map((project) => (project.id === next.id ? next : project))
    )
    setSelectedProject((current) =>
      current?.id === next.id ? next : current
    )
    refresh()
  }

  function resetCreateForm() {
    setCreateName("")
    setCreateCategory("Web Application")
    setCreateClientId(initialClientId ?? "")
    setCreateDescription("")
    setCreateStatus("In Progress")
    setCreatePriority("Medium")
    setCreateProgress("0")
    setCreateStartDate("")
    setCreateDueDate("")
    setCreateTeam("")
  }

  async function createProject(event: FormEvent) {
    event.preventDefault()
    const progress = Number(createProgress)
    if (!createClientId) {
      notify.error("Select a client.")
      return
    }
    if (Number.isNaN(progress) || progress < 0 || progress > 100) {
      notify.error("Progress must be between 0 and 100.")
      return
    }

    const response = await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: createName,
        category: createCategory,
        client_id: createClientId,
        description: createDescription,
        status: createStatus,
        priority: createPriority,
        progress,
        start_date: createStartDate || null,
        due_date: createDueDate || null,
        team_initials: createTeam,
      }),
    })

    if (!response.ok) {
      notify.error(await readError(response))
      return
    }

    const data = (await response.json()) as { project: ProjectView }
    setProjects((current) => [data.project, ...current])
    setSelectedProject(data.project)
    setCreateOpen(false)
    resetCreateForm()
    notify.success("Project created.")
    refresh()
  }

  async function deleteProject(id: string) {
    const response = await fetch(`/api/admin/projects/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      notify.error(await readError(response))
      return
    }

    setProjects((current) => current.filter((project) => project.id !== id))
    setDeleteTarget(null)
    if (selectedProject?.id === id) setSelectedProject(null)
    notify.success("Project deleted.")
    refresh()
  }

  function exportProjects() {
    const headings = ["Project", "Client", "Status", "Progress", "Due date"]
    const rows = filteredProjects.map((project) => [
      project.name,
      project.client,
      project.status,
      `${project.progress}%`,
      project.dueDate,
    ])
    const csv = [headings, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "techyx360-projects.csv"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span>Projects</span>
            <ChevronRight className="size-3.5" aria-hidden />
            <span>Projects</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Projects
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage all client projects and track progress.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={exportProjects}
            className="h-11 shrink-0 gap-2 rounded-xl px-4"
          >
            <Download className="size-4" aria-hidden />
            Export
          </Button>
          <Button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="h-11 shrink-0 gap-2 rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
          >
            <Plus className="size-4" aria-hidden />
            New project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total Projects"
          value={counts.all}
          icon={FolderKanban}
          accent="bg-blue-500/10 text-blue-600"
        />
        <StatCard
          label="In Progress"
          value={counts["In Progress"]}
          icon={Play}
          accent="bg-sky-500/10 text-sky-600"
        />
        <StatCard
          label="On Hold"
          value={counts["On Hold"]}
          icon={Pause}
          accent="bg-amber-500/10 text-amber-600"
        />
        <StatCard
          label="Completed"
          value={counts.Completed}
          icon={CheckCircle2}
          accent="bg-emerald-500/10 text-emerald-600"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 flex-wrap gap-1">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                  activeFilter === filter.value
                    ? "bg-brand/10 text-brand"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {filter.label}
                <span className="ml-1.5 tabular-nums text-xs opacity-70">
                  {filter.value === "all" ? counts.all : counts[filter.value]}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:max-w-xs">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search projects..."
                className="h-10 rounded-xl pl-9"
              />
            </div>
            <div className="hidden rounded-xl border border-border/60 p-1 sm:flex">
              <button
                type="button"
                onClick={() => setView("list")}
                className={cn(
                  "rounded-lg p-2 transition-colors",
                  view === "list"
                    ? "bg-brand/10 text-brand"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-label="List view"
              >
                <List className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setView("grid")}
                className={cn(
                  "rounded-lg p-2 transition-colors",
                  view === "grid"
                    ? "bg-brand/10 text-brand"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-label="Grid view"
              >
                <Grid2X2 className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        {view === "list" ? (
          filteredProjects.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                    <th className="px-5 py-3 font-semibold">Project</th>
                    <th className="px-4 py-3 font-semibold">Client</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Progress</th>
                    <th className="px-4 py-3 font-semibold">Due date</th>
                    <th className="px-4 py-3 font-semibold">Team</th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredProjects.map((project) => (
                    <tr
                      key={project.id}
                      className="cursor-pointer transition-colors hover:bg-muted/30"
                      onClick={() => setSelectedProject(project)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                              project.accent
                            )}
                          >
                            {project.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">
                              {project.name}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {project.category}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-foreground">
                        {project.client}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          className={cn(
                            "border-0 font-medium",
                            statusStyles[project.status]
                          )}
                        >
                          {project.status}
                        </Badge>
                      </td>
                      <td className="w-48 px-4 py-3.5">
                        <ProjectProgress
                          progress={project.progress}
                          status={project.status}
                        />
                      </td>
                      <td
                        className={cn(
                          "whitespace-nowrap px-4 py-3.5 text-xs",
                          project.overdue
                            ? "font-semibold text-red-600"
                            : "text-muted-foreground"
                        )}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="size-3.5" aria-hidden />
                          {project.dueDate}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <TeamAvatars members={project.team} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          className="rounded-lg text-muted-foreground"
                          aria-label={`Actions for ${project.name}`}
                          onClick={(event) => {
                            event.stopPropagation()
                            setSelectedProject(project)
                          }}
                        >
                          <MoreVertical className="size-4" aria-hidden />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No projects match your filters.
            </div>
          )
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => setSelectedProject(project)}
                className="rounded-2xl border border-border/60 p-4 text-left transition-colors hover:bg-muted/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl text-sm font-bold",
                      project.accent
                    )}
                  >
                    {project.initials}
                  </div>
                  <Badge
                    className={cn(
                      "border-0 font-medium",
                      statusStyles[project.status]
                    )}
                  >
                    {project.status}
                  </Badge>
                </div>
                <h3 className="mt-3 font-semibold text-foreground">
                  {project.name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {project.client}
                </p>
                <div className="mt-4">
                  <ProjectProgress
                    progress={project.progress}
                    status={project.status}
                  />
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock3 className="size-3.5" aria-hidden />
                  Due {project.dueDate}
                </p>
              </button>
            ))}
            {filteredProjects.length === 0 ? (
              <div className="col-span-full px-6 py-12 text-center text-sm text-muted-foreground">
                No projects match your filters.
              </div>
            ) : null}
          </div>
        )}
      </section>

      <Sheet
        open={selectedProject != null}
        onOpenChange={(open) => {
          if (!open) setSelectedProject(null)
        }}
      >
        <SheetContent
          side="right"
          showCloseButton
          className="admin-ui w-full gap-0 overflow-hidden p-0 data-[side=right]:w-full data-[side=right]:sm:w-[45vw] data-[side=right]:sm:max-w-[45vw]"
        >
          {selectedProject ? (
            <ProjectDetailContent
              key={selectedProject.id}
              project={selectedProject}
              clients={clients}
              isPending={isPending}
              onProjectChange={applyProject}
              onDelete={() => setDeleteTarget(selectedProject)}
            />
          ) : null}
        </SheetContent>
      </Sheet>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open)
          if (!open) resetCreateForm()
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New project</DialogTitle>
            <DialogDescription>
              Create a delivery project linked to a CRM client.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => void createProject(event)}
            className="space-y-3"
          >
            <div>
              <label htmlFor="create-name" className={labelClassName}>
                Project name
              </label>
              <Input
                id="create-name"
                value={createName}
                onChange={(event) => setCreateName(event.target.value)}
                placeholder="e.g. School Management System"
                className={fieldClassName}
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="create-category" className={labelClassName}>
                  Category
                </label>
                <Input
                  id="create-category"
                  value={createCategory}
                  onChange={(event) => setCreateCategory(event.target.value)}
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="create-client" className={labelClassName}>
                  Client
                </label>
                <select
                  id="create-client"
                  value={createClientId}
                  onChange={(event) => setCreateClientId(event.target.value)}
                  className={selectClassName}
                  required
                >
                  <option value="">Select client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.company}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="create-description" className={labelClassName}>
                Description
              </label>
              <textarea
                id="create-description"
                value={createDescription}
                onChange={(event) => setCreateDescription(event.target.value)}
                className={textareaClassName}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="create-status" className={labelClassName}>
                  Status
                </label>
                <select
                  id="create-status"
                  value={createStatus}
                  onChange={(event) =>
                    setCreateStatus(event.target.value as ProjectStatusLabel)
                  }
                  className={selectClassName}
                >
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
              <div>
                <label htmlFor="create-priority" className={labelClassName}>
                  Priority
                </label>
                <select
                  id="create-priority"
                  value={createPriority}
                  onChange={(event) =>
                    setCreatePriority(
                      event.target.value as ProjectPriorityLabel
                    )
                  }
                  className={selectClassName}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label htmlFor="create-progress" className={labelClassName}>
                  Progress (%)
                </label>
                <Input
                  id="create-progress"
                  type="number"
                  min={0}
                  max={100}
                  value={createProgress}
                  onChange={(event) => setCreateProgress(event.target.value)}
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="create-team" className={labelClassName}>
                  Team initials
                </label>
                <Input
                  id="create-team"
                  value={createTeam}
                  onChange={(event) => setCreateTeam(event.target.value)}
                  placeholder="KA, CM, TO"
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="create-start" className={labelClassName}>
                  Start date
                </label>
                <Input
                  id="create-start"
                  type="date"
                  value={createStartDate}
                  onChange={(event) => setCreateStartDate(event.target.value)}
                  className={fieldClassName}
                />
              </div>
              <div>
                <label htmlFor="create-due" className={labelClassName}>
                  Due date
                </label>
                <Input
                  id="create-due"
                  type="date"
                  value={createDueDate}
                  onChange={(event) => setCreateDueDate(event.target.value)}
                  className={fieldClassName}
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || clients.length === 0}
                className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
              >
                Create project
              </Button>
            </DialogFooter>
            {clients.length === 0 ? (
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Add a CRM client first before creating a project.
              </p>
            ) : null}
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete project?</DialogTitle>
            <DialogDescription>
              This permanently removes{" "}
              {deleteTarget ? deleteTarget.name : "this project"} and its
              milestones and tasks. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => {
                if (deleteTarget) void deleteProject(deleteTarget.id)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
