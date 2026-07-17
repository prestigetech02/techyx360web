export type ProjectStatusDb =
  | "in_progress"
  | "on_hold"
  | "completed"
  | "overdue"

export type ProjectPriorityDb = "low" | "medium" | "high"

export type ProjectStatusLabel =
  | "In Progress"
  | "On Hold"
  | "Completed"
  | "Overdue"

export type ProjectPriorityLabel = "Low" | "Medium" | "High"

export type ProjectMilestoneView = {
  id: string
  title: string
  date: string
  dueDate: string | null
  done: boolean
  sortOrder: number
}

export type ProjectTaskView = {
  id: string
  title: string
  assignee: string
  done: boolean
  sortOrder: number
}

export type ProjectView = {
  id: string
  clientId: string | null
  name: string
  category: string
  client: string
  clientAvatarUrl: string | null
  status: ProjectStatusLabel
  statusDb: ProjectStatusDb
  progress: number
  dueDate: string
  dueDateIso: string | null
  startDate: string
  startDateIso: string | null
  priority: ProjectPriorityLabel
  priorityDb: ProjectPriorityDb
  description: string
  overdue: boolean
  initials: string
  accent: string
  team: string[]
  milestones: ProjectMilestoneView[]
  tasks: ProjectTaskView[]
  createdAt: string
  updatedAt: string
}

export type ProjectClientOption = {
  id: string
  company: string
}

export const PROJECT_STATUSES = new Set<ProjectStatusDb>([
  "in_progress",
  "on_hold",
  "completed",
  "overdue",
])

export const PROJECT_PRIORITIES = new Set<ProjectPriorityDb>([
  "low",
  "medium",
  "high",
])

export const PROJECT_STATUS_LABELS: Record<
  ProjectStatusDb,
  ProjectStatusLabel
> = {
  in_progress: "In Progress",
  on_hold: "On Hold",
  completed: "Completed",
  overdue: "Overdue",
}

export const PROJECT_PRIORITY_LABELS: Record<
  ProjectPriorityDb,
  ProjectPriorityLabel
> = {
  low: "Low",
  medium: "Medium",
  high: "High",
}

export const PROJECT_STATUS_FROM_LABEL: Record<
  ProjectStatusLabel,
  ProjectStatusDb
> = {
  "In Progress": "in_progress",
  "On Hold": "on_hold",
  Completed: "completed",
  Overdue: "overdue",
}

export const PROJECT_PRIORITY_FROM_LABEL: Record<
  ProjectPriorityLabel,
  ProjectPriorityDb
> = {
  Low: "low",
  Medium: "medium",
  High: "high",
}

const ACCENT_CLASSES = [
  "bg-[#0b2c66] text-white",
  "bg-blue-600 text-white",
  "bg-violet-600 text-white",
  "bg-emerald-600 text-white",
  "bg-rose-600 text-white",
  "bg-amber-600 text-white",
  "bg-sky-600 text-white",
  "bg-zinc-800 text-white",
]

export function getProjectInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "P"
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
}

export function getProjectAccent(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % ACCENT_CLASSES.length
  }
  return ACCENT_CLASSES[hash] ?? ACCENT_CLASSES[0]
}

export function isProjectStatusDb(value: string): value is ProjectStatusDb {
  return PROJECT_STATUSES.has(value as ProjectStatusDb)
}

export function isProjectPriorityDb(value: string): value is ProjectPriorityDb {
  return PROJECT_PRIORITIES.has(value as ProjectPriorityDb)
}

export function normalizeProjectStatusInput(
  value: string
): ProjectStatusDb | null {
  const trimmed = value.trim()
  if (isProjectStatusDb(trimmed)) return trimmed
  if (trimmed in PROJECT_STATUS_FROM_LABEL) {
    return PROJECT_STATUS_FROM_LABEL[trimmed as ProjectStatusLabel]
  }
  const lower = trimmed.toLowerCase().replace(/\s+/g, "_")
  if (isProjectStatusDb(lower)) return lower
  return null
}

export function normalizeProjectPriorityInput(
  value: string
): ProjectPriorityDb | null {
  const trimmed = value.trim()
  if (isProjectPriorityDb(trimmed)) return trimmed
  if (trimmed in PROJECT_PRIORITY_FROM_LABEL) {
    return PROJECT_PRIORITY_FROM_LABEL[trimmed as ProjectPriorityLabel]
  }
  const lower = trimmed.toLowerCase()
  if (isProjectPriorityDb(lower)) return lower
  return null
}
