import type {
  AdminNavChildItem,
  AdminNavItem,
  AdminNavLeafItem,
} from "@/config/admin-nav"
import { isPublicAdminAuthPath } from "@/lib/admin/auth-callback"

export type AdminModuleKey =
  | "dashboard"
  | "crm"
  | "projects"
  | "academy"
  | "team"
  | "work"
  | "recruitment"
  | "finance"
  | "orders"
  | "content"
  | "settings"

export type DashboardAccessRole = "admin" | "staff"

export type DashboardAccess = {
  kind: "admin" | "staff"
  email: string
  memberId: string | null
  modules: AdminModuleKey[]
}

export const ADMIN_MODULE_OPTIONS: {
  key: AdminModuleKey
  label: string
}[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "crm", label: "CRM" },
  { key: "projects", label: "Projects" },
  { key: "academy", label: "Academy" },
  { key: "team", label: "Team" },
  { key: "work", label: "Tasks" },
  { key: "recruitment", label: "Recruitment" },
  { key: "finance", label: "Finance" },
  { key: "orders", label: "Orders" },
  { key: "content", label: "Content & Marketing" },
  { key: "settings", label: "Settings" },
]

export const ADMIN_MODULE_KEYS = ADMIN_MODULE_OPTIONS.map((item) => item.key)

const MODULE_SET = new Set<string>(ADMIN_MODULE_KEYS)

export function isAdminModuleKey(value: string): value is AdminModuleKey {
  return MODULE_SET.has(value)
}

export function isDashboardAccessRole(
  value: string
): value is DashboardAccessRole {
  return value === "admin" || value === "staff"
}

export function parseModuleList(value: unknown): AdminModuleKey[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(isAdminModuleKey)
}

export function normalizeStaffModules(modules: AdminModuleKey[]) {
  return [...new Set(["work" as const, ...modules])]
}

const PAGE_PREFIXES: Array<{ prefix: string; module: AdminModuleKey }> = [
  { prefix: "/admin/leads", module: "crm" },
  { prefix: "/admin/clients", module: "crm" },
  { prefix: "/admin/contact", module: "crm" },
  { prefix: "/admin/projects", module: "projects" },
  { prefix: "/admin/registrations", module: "academy" },
  { prefix: "/admin/students", module: "academy" },
  { prefix: "/admin/team", module: "team" },
  { prefix: "/admin/work", module: "work" },
  { prefix: "/admin/job-listings", module: "recruitment" },
  { prefix: "/admin/job-applications", module: "recruitment" },
  { prefix: "/admin/talent-pool", module: "recruitment" },
  { prefix: "/admin/talent-requests", module: "recruitment" },
  { prefix: "/admin/submissions", module: "recruitment" },
  { prefix: "/admin/reports", module: "finance" },
  { prefix: "/admin/payroll", module: "finance" },
  { prefix: "/admin/invoices", module: "finance" },
  { prefix: "/admin/expenses", module: "finance" },
  { prefix: "/admin/payments", module: "finance" },
  { prefix: "/admin/hosting", module: "orders" },
  { prefix: "/admin/domains", module: "orders" },
  { prefix: "/admin/blog", module: "content" },
  { prefix: "/admin/settings", module: "settings" },
]

const API_PREFIXES: Array<{ prefix: string; module: AdminModuleKey | "any" }> =
  [
    { prefix: "/api/admin/search", module: "any" },
    { prefix: "/api/admin/staff-tasks", module: "work" },
    { prefix: "/api/admin/staff-daily-logs", module: "work" },
    { prefix: "/api/admin/leads", module: "crm" },
    { prefix: "/api/admin/clients", module: "crm" },
    { prefix: "/api/admin/contact-submissions", module: "crm" },
    { prefix: "/api/admin/deals", module: "crm" },
    { prefix: "/api/admin/client-avatars", module: "crm" },
    { prefix: "/api/admin/projects", module: "projects" },
    { prefix: "/api/admin/course-registrations", module: "academy" },
    { prefix: "/api/admin/students", module: "academy" },
    { prefix: "/api/admin/team-members", module: "team" },
    { prefix: "/api/admin/job-openings", module: "recruitment" },
    { prefix: "/api/admin/career-applications", module: "recruitment" },
    { prefix: "/api/admin/talent-pool", module: "recruitment" },
    { prefix: "/api/admin/talent-requests", module: "recruitment" },
    { prefix: "/api/admin/pif-applications", module: "recruitment" },
    { prefix: "/api/admin/payroll", module: "finance" },
    { prefix: "/api/admin/invoices", module: "finance" },
    { prefix: "/api/admin/expenses", module: "finance" },
    { prefix: "/api/admin/payments", module: "finance" },
    { prefix: "/api/admin/reconciliations", module: "finance" },
    { prefix: "/api/admin/hosting-accounts", module: "orders" },
    { prefix: "/api/admin/domain-accounts", module: "orders" },
    { prefix: "/api/admin/blog-posts", module: "content" },
    { prefix: "/api/admin/blog-images", module: "content" },
  ]

const NAV_MODULE_BY_LABEL: Record<string, AdminModuleKey> = {
  Dashboard: "dashboard",
  CRM: "crm",
  Projects: "projects",
  Academy: "academy",
  Team: "team",
  Tasks: "work",
  Recruitment: "recruitment",
  Finance: "finance",
  Orders: "orders",
  "Content & Marketing": "content",
  Settings: "settings",
}

function matchPrefix(
  path: string,
  rules: Array<{ prefix: string; module: AdminModuleKey | "any" }>
) {
  for (const rule of rules) {
    if (path === rule.prefix || path.startsWith(`${rule.prefix}/`)) {
      return rule.module
    }
  }
  return null
}

export function moduleForPath(path: string): AdminModuleKey | "any" | null {
  if (path.startsWith("/api/admin")) {
    return matchPrefix(path, API_PREFIXES)
  }

  if (path === "/admin") return "dashboard"
  return matchPrefix(path, PAGE_PREFIXES)
}

export function hasModule(
  access: DashboardAccess,
  module: AdminModuleKey | "any"
) {
  if (module === "any") return true
  if (access.kind === "admin") return true
  return access.modules.includes(module)
}

export function canAccessPath(access: DashboardAccess, path: string) {
  if (isPublicAdminAuthPath(path)) {
    return true
  }

  const module = moduleForPath(path)
  if (!module) {
    return access.kind === "admin"
  }
  return hasModule(access, module)
}

export function firstAllowedPath(access: DashboardAccess) {
  if (access.kind === "admin") return "/admin"
  const preferred: AdminModuleKey[] = [
    "work",
    "dashboard",
    ...access.modules,
  ]
  const unique = [...new Set(preferred)]
  for (const module of unique) {
    if (!hasModule(access, module)) continue
    if (module === "dashboard") return "/admin"
    if (module === "work") return "/admin/work"
    if (module === "crm") return "/admin/leads"
    if (module === "projects") return "/admin/projects"
    if (module === "academy") return "/admin/registrations"
    if (module === "team") return "/admin/team"
    if (module === "recruitment") return "/admin/job-listings"
    if (module === "finance") return "/admin/invoices"
    if (module === "orders") return "/admin/hosting"
    if (module === "content") return "/admin/blog"
    if (module === "settings") return "/admin/settings"
  }
  return "/admin/work"
}

function moduleForNavLabel(label: string): AdminModuleKey | null {
  return NAV_MODULE_BY_LABEL[label] ?? null
}

function keepLeaf(
  item: AdminNavLeafItem,
  access: DashboardAccess,
  parentModule: AdminModuleKey | null
) {
  if (item.comingSoon) return false
  if (!item.href) return access.kind === "admin"
  const module = moduleForPath(item.href) ?? parentModule
  if (!module) return access.kind === "admin"
  return hasModule(access, module)
}

export function filterAdminNav(
  items: AdminNavItem[],
  access: DashboardAccess
): AdminNavItem[] {
  if (access.kind === "admin") return items

  return items.flatMap((item) => {
    const parentModule = moduleForNavLabel(item.label)
    if (item.href && !item.children?.length) {
      return keepLeaf(item, access, parentModule) ? [item] : []
    }

    const children: AdminNavChildItem[] = []
    for (const child of item.children ?? []) {
      const nested = (child.children ?? []).filter((leaf) =>
        keepLeaf(leaf, access, parentModule)
      )
      const keepSelf = keepLeaf(child, access, parentModule)
      if (!keepSelf && nested.length === 0) continue
      children.push({
        ...child,
        children: nested.length > 0 ? nested : undefined,
      })
    }

    if (children.length === 0) return []
    return [{ ...item, children }]
  })
}

export function fullAdminAccess(email: string): DashboardAccess {
  return {
    kind: "admin",
    email,
    memberId: null,
    modules: [...ADMIN_MODULE_KEYS],
  }
}
