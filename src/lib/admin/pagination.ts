export const DEFAULT_ADMIN_PAGE_SIZE = 25

export type AdminPaginationMeta = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type AdminListStats = {
  total: number
  newCount: number
  thisWeek: number
  replied: number
}

export type AdminStatusFilter = "all" | "new" | "read" | "replied"

const STATUS_FILTERS = new Set<AdminStatusFilter>([
  "all",
  "new",
  "read",
  "replied",
])

export function parseAdminStatusFilter(value: string | undefined): AdminStatusFilter {
  if (value && STATUS_FILTERS.has(value as AdminStatusFilter)) {
    return value as AdminStatusFilter
  }
  return "all"
}

export type AdminExtendedStatusFilter = AdminStatusFilter | "converted"

const EXTENDED_STATUS_FILTERS = new Set<AdminExtendedStatusFilter>([
  "all",
  "new",
  "read",
  "replied",
  "converted",
])

export function parseAdminExtendedStatusFilter(
  value: string | undefined
): AdminExtendedStatusFilter {
  if (value && EXTENDED_STATUS_FILTERS.has(value as AdminExtendedStatusFilter)) {
    return value as AdminExtendedStatusFilter
  }
  return "all"
}

export function parseAdminPage(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "1", 10)
  if (!Number.isFinite(parsed) || parsed < 1) return 1
  return parsed
}

export function getAdminPaginationMeta(
  page: number,
  pageSize: number,
  total: number
): AdminPaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)

  return {
    page: safePage,
    pageSize,
    total,
    totalPages,
  }
}

export function getAdminRange(page: number, pageSize: number) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  return { from, to }
}

export function getWeekStartIso() {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  return weekAgo.toISOString()
}
