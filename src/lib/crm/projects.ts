import "server-only"

import {
  getProjectAccent,
  getProjectInitials,
  isProjectPriorityDb,
  isProjectStatusDb,
  PROJECT_PRIORITY_LABELS,
  PROJECT_STATUS_LABELS,
  type ProjectMilestoneView,
  type ProjectTaskView,
  type ProjectView,
} from "@/lib/crm/project-types"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import type { Database } from "@/types/database"

export type {
  ProjectClientOption,
  ProjectMilestoneView,
  ProjectPriorityDb,
  ProjectPriorityLabel,
  ProjectStatusDb,
  ProjectStatusLabel,
  ProjectTaskView,
  ProjectView,
} from "@/lib/crm/project-types"

export {
  getProjectAccent,
  getProjectInitials,
  normalizeProjectPriorityInput,
  normalizeProjectStatusInput,
  PROJECT_PRIORITIES,
  PROJECT_PRIORITY_FROM_LABEL,
  PROJECT_PRIORITY_LABELS,
  PROJECT_STATUSES,
  PROJECT_STATUS_FROM_LABEL,
  PROJECT_STATUS_LABELS,
} from "@/lib/crm/project-types"

export type CrmProjectRow = Database["public"]["Tables"]["crm_projects"]["Row"]
export type CrmProjectMilestoneRow =
  Database["public"]["Tables"]["crm_project_milestones"]["Row"]
export type CrmProjectTaskRow =
  Database["public"]["Tables"]["crm_project_tasks"]["Row"]

function formatProjectDate(value: string | null | undefined) {
  if (!value) return "—"
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function isOverdue(dueDate: string | null, status: string) {
  if (!dueDate || status === "completed") return false
  const due = new Date(`${dueDate}T00:00:00`)
  if (Number.isNaN(due.getTime())) return status === "overdue"
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return due.getTime() < today.getTime() || status === "overdue"
}

export function mapMilestoneRow(
  row: CrmProjectMilestoneRow
): ProjectMilestoneView {
  return {
    id: row.id,
    title: row.title,
    date: formatProjectDate(row.due_date),
    dueDate: row.due_date,
    done: row.done,
    sortOrder: row.sort_order,
  }
}

export function mapTaskRow(row: CrmProjectTaskRow): ProjectTaskView {
  return {
    id: row.id,
    title: row.title,
    assignee: row.assignee,
    done: row.done,
    sortOrder: row.sort_order,
  }
}

export function mapProjectRowToView(
  row: CrmProjectRow,
  client: { company: string | null; avatarUrl: string | null } | null,
  milestones: CrmProjectMilestoneRow[] = [],
  tasks: CrmProjectTaskRow[] = []
): ProjectView {
  const statusDb = isProjectStatusDb(row.status) ? row.status : "in_progress"
  const priorityDb = isProjectPriorityDb(row.priority) ? row.priority : "medium"
  const clientName = client?.company?.trim() || "Unassigned client"

  return {
    id: row.id,
    clientId: row.client_id,
    name: row.name,
    category: row.category,
    client: clientName,
    clientAvatarUrl: client?.avatarUrl ?? null,
    status: PROJECT_STATUS_LABELS[statusDb],
    statusDb,
    progress: row.progress,
    dueDate: formatProjectDate(row.due_date),
    dueDateIso: row.due_date,
    startDate: formatProjectDate(row.start_date),
    startDateIso: row.start_date,
    priority: PROJECT_PRIORITY_LABELS[priorityDb],
    priorityDb,
    description: row.description,
    overdue: isOverdue(row.due_date, statusDb),
    initials: getProjectInitials(clientName === "Unassigned client" ? row.name : clientName),
    accent: getProjectAccent(row.client_id ?? row.id),
    team: row.team_initials ?? [],
    milestones: [...milestones]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(mapMilestoneRow),
    tasks: [...tasks]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(mapTaskRow),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const PROJECT_SELECT =
  "id, client_id, name, category, description, status, priority, progress, start_date, due_date, team_initials, created_at, updated_at"

async function loadChildren(projectIds: string[]) {
  const supabase = createAdminClient()

  if (projectIds.length === 0) {
    return {
      milestonesByProject: new Map<string, CrmProjectMilestoneRow[]>(),
      tasksByProject: new Map<string, CrmProjectTaskRow[]>(),
    }
  }

  const [milestonesResult, tasksResult] = await Promise.all([
    supabase
      .from("crm_project_milestones")
      .select("id, project_id, title, due_date, done, sort_order, created_at")
      .in("project_id", projectIds)
      .order("sort_order", { ascending: true }),
    supabase
      .from("crm_project_tasks")
      .select("id, project_id, title, assignee, done, sort_order, created_at")
      .in("project_id", projectIds)
      .order("sort_order", { ascending: true }),
  ])

  if (milestonesResult.error) {
    console.error("Failed to load project milestones", milestonesResult.error)
  }
  if (tasksResult.error) {
    console.error("Failed to load project tasks", tasksResult.error)
  }

  const milestonesByProject = new Map<string, CrmProjectMilestoneRow[]>()
  for (const milestone of milestonesResult.data ?? []) {
    const list = milestonesByProject.get(milestone.project_id) ?? []
    list.push(milestone)
    milestonesByProject.set(milestone.project_id, list)
  }

  const tasksByProject = new Map<string, CrmProjectTaskRow[]>()
  for (const task of tasksResult.data ?? []) {
    const list = tasksByProject.get(task.project_id) ?? []
    list.push(task)
    tasksByProject.set(task.project_id, list)
  }

  return { milestonesByProject, tasksByProject }
}

async function loadClientInfo(clientIds: string[]) {
  const supabase = createAdminClient()
  const uniqueIds = [...new Set(clientIds.filter(Boolean))]
  const clients = new Map<
    string,
    { company: string | null; avatarUrl: string | null }
  >()

  if (uniqueIds.length === 0) return clients

  const { data, error } = await supabase
    .from("crm_clients")
    .select("id, company, avatar_url")
    .in("id", uniqueIds)

  if (error) {
    console.error("Failed to load project client info", error)
    return clients
  }

  for (const client of data ?? []) {
    clients.set(client.id, {
      company: client.company,
      avatarUrl: client.avatar_url?.trim() || null,
    })
  }

  return clients
}

export async function getAllProjects(): Promise<ProjectView[]> {
  if (!isSupabaseConfigured()) return []

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crm_projects")
    .select(PROJECT_SELECT)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to load CRM projects", error)
    throw error
  }

  const projects = data ?? []
  if (projects.length === 0) return []

  const ids = projects.map((project) => project.id)
  const clientIds = projects
    .map((project) => project.client_id)
    .filter((id): id is string => Boolean(id))

  const [{ milestonesByProject, tasksByProject }, clientInfo] =
    await Promise.all([loadChildren(ids), loadClientInfo(clientIds)])

  return projects.map((project) =>
    mapProjectRowToView(
      project,
      project.client_id ? clientInfo.get(project.client_id) ?? null : null,
      milestonesByProject.get(project.id) ?? [],
      tasksByProject.get(project.id) ?? []
    )
  )
}

export async function getProjectById(id: string): Promise<ProjectView | null> {
  if (!isSupabaseConfigured()) return null

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crm_projects")
    .select(PROJECT_SELECT)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("Failed to load CRM project", error)
    throw error
  }

  if (!data) return null

  const [{ milestonesByProject, tasksByProject }, clientInfo] =
    await Promise.all([
      loadChildren([id]),
      loadClientInfo(data.client_id ? [data.client_id] : []),
    ])

  return mapProjectRowToView(
    data,
    data.client_id ? clientInfo.get(data.client_id) ?? null : null,
    milestonesByProject.get(id) ?? [],
    tasksByProject.get(id) ?? []
  )
}

export async function getProjectsByClientId(
  clientId: string
): Promise<ProjectView[]> {
  if (!isSupabaseConfigured()) return []

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crm_projects")
    .select(PROJECT_SELECT)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to load client projects", error)
    throw error
  }

  const projects = data ?? []
  if (projects.length === 0) return []

  const ids = projects.map((project) => project.id)
  const [{ milestonesByProject, tasksByProject }, clientInfo] =
    await Promise.all([loadChildren(ids), loadClientInfo([clientId])])

  const client = clientInfo.get(clientId) ?? null

  return projects.map((project) =>
    mapProjectRowToView(
      project,
      client,
      milestonesByProject.get(project.id) ?? [],
      tasksByProject.get(project.id) ?? []
    )
  )
}
