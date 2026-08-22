import "server-only"

import {
  attachNotesToClients,
  CLIENT_SELECT,
  type CrmClientRow,
} from "@/lib/crm/clients"
import {
  CLIENT_STATUSES,
  type ClientStatus,
  type ClientView,
} from "@/lib/crm/client-types"
import {
  DEFAULT_ADMIN_PAGE_SIZE,
  getAdminPaginationMeta,
  getAdminRange,
  parseAdminPage,
  type AdminPaginationMeta,
} from "@/lib/admin/pagination"
import { createAdminClient } from "@/lib/supabase/admin"

export type ClientStatusFilter = "all" | ClientStatus

export type ClientsListFilters = {
  q: string
  industry: string
  companySize: string
  location: string
}

export type ClientListStats = {
  total: number
  active: number
  inactive: number
  archived: number
}

export type ClientsFilterOptions = {
  industries: string[]
  locations: string[]
}

export type ClientsPageData = {
  clients: ClientView[]
  pagination: AdminPaginationMeta
  stats: ClientListStats
  statusFilter: ClientStatusFilter
  listFilters: ClientsListFilters
  filterOptions: ClientsFilterOptions
}

function toIlikePattern(query: string) {
  const safe = query.trim().replace(/[%_]/g, " ").replace(/\s+/g, " ").trim()
  return `%${safe}%`
}

export function parseClientStatusFilter(
  value: string | undefined
): ClientStatusFilter {
  if (value && CLIENT_STATUSES.has(value as ClientStatus)) {
    return value as ClientStatus
  }
  return "all"
}

export function parseClientsListFilters(options: {
  q?: string
  industry?: string
  companySize?: string
  location?: string
}): ClientsListFilters {
  return {
    q: options.q?.trim() ?? "",
    industry: options.industry?.trim() ?? "",
    companySize: options.companySize?.trim() ?? "",
    location: options.location?.trim() ?? "",
  }
}

async function getClientListStats(): Promise<ClientListStats> {
  const supabase = createAdminClient()

  const [totalResult, activeResult, inactiveResult, archivedResult] =
    await Promise.all([
      supabase.from("crm_clients").select("id", { count: "exact", head: true }),
      supabase
        .from("crm_clients")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("crm_clients")
        .select("id", { count: "exact", head: true })
        .eq("status", "inactive"),
      supabase
        .from("crm_clients")
        .select("id", { count: "exact", head: true })
        .eq("status", "archived"),
    ])

  return {
    total: totalResult.count ?? 0,
    active: activeResult.count ?? 0,
    inactive: inactiveResult.count ?? 0,
    archived: archivedResult.count ?? 0,
  }
}

async function getClientFilterOptions(): Promise<ClientsFilterOptions> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crm_clients")
    .select("industry, location")

  if (error) {
    console.error("Failed to load client filter options", error)
    return { industries: [], locations: [] }
  }

  const industries = new Set<string>()
  const locations = new Set<string>()

  for (const row of data ?? []) {
    const industry = row.industry?.trim()
    const location = row.location?.trim()
    if (industry) industries.add(industry)
    if (location) locations.add(location)
  }

  return {
    industries: Array.from(industries).sort((a, b) => a.localeCompare(b)),
    locations: Array.from(locations).sort((a, b) => a.localeCompare(b)),
  }
}

function applyClientsListFilters<
  T extends {
    eq: (column: string, value: string) => T
    or: (filters: string) => T
  },
>(query: T, statusFilter: ClientStatusFilter, listFilters: ClientsListFilters) {
  let next = query

  if (statusFilter !== "all") {
    next = next.eq("status", statusFilter)
  }

  if (listFilters.industry) {
    next = next.eq("industry", listFilters.industry)
  }

  if (listFilters.companySize) {
    next = next.eq("company_size", listFilters.companySize)
  }

  if (listFilters.location) {
    next = next.eq("location", listFilters.location)
  }

  if (listFilters.q) {
    const pattern = `"${toIlikePattern(listFilters.q)}"`
    next = next.or(
      `company.ilike.${pattern},contact_name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern},industry.ilike.${pattern},location.ilike.${pattern},product.ilike.${pattern}`
    )
  }

  return next
}

export async function getClientsPageData(options: {
  page?: string
  status?: string
  q?: string
  industry?: string
  companySize?: string
  location?: string
  pageSize?: number
}): Promise<ClientsPageData> {
  const pageSize = options.pageSize ?? DEFAULT_ADMIN_PAGE_SIZE
  const statusFilter = parseClientStatusFilter(options.status)
  const listFilters = parseClientsListFilters(options)
  const requestedPage = parseAdminPage(options.page)

  const supabase = createAdminClient()

  let countQuery = supabase
    .from("crm_clients")
    .select("id", { count: "exact", head: true })

  countQuery = applyClientsListFilters(countQuery, statusFilter, listFilters)

  const { count: filteredTotal, error: countError } = await countQuery

  if (countError) {
    throw countError
  }

  const total = filteredTotal ?? 0
  const paginationMeta = getAdminPaginationMeta(requestedPage, pageSize, total)
  const { from, to } = getAdminRange(paginationMeta.page, pageSize)

  let dataQuery = supabase
    .from("crm_clients")
    .select(CLIENT_SELECT)
    .order("created_at", { ascending: false })
    .range(from, to)

  dataQuery = applyClientsListFilters(dataQuery, statusFilter, listFilters)

  const [{ data, error: dataError }, stats, filterOptions] = await Promise.all([
    dataQuery,
    getClientListStats(),
    getClientFilterOptions(),
  ])

  if (dataError) {
    throw dataError
  }

  const clients = await attachNotesToClients((data ?? []) as CrmClientRow[])

  return {
    clients,
    pagination: paginationMeta,
    stats,
    statusFilter,
    listFilters,
    filterOptions,
  }
}
