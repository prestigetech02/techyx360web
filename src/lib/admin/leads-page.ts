import "server-only"

import {
  attachNotesAndActivitiesToLeads,
  LEAD_SELECT,
  type CrmLeadRow,
} from "@/lib/crm/leads"
import { LEAD_STATUSES, type LeadStatus, type LeadView } from "@/lib/crm/lead-types"
import {
  DEFAULT_ADMIN_PAGE_SIZE,
  getAdminPaginationMeta,
  getAdminRange,
  parseAdminPage,
  type AdminPaginationMeta,
} from "@/lib/admin/pagination"
import { createAdminClient } from "@/lib/supabase/admin"

export type LeadStatusFilter = "all" | LeadStatus

export type LeadsListFilters = {
  q: string
  source: string
  assigned: string
  minScore: string
}

export type LeadListStats = {
  total: number
  newCount: number
  contacted: number
  qualified: number
  converted: number
  lost: number
}

export type LeadsPageData = {
  leads: LeadView[]
  pagination: AdminPaginationMeta
  stats: LeadListStats
  statusFilter: LeadStatusFilter
  listFilters: LeadsListFilters
}

function toIlikePattern(query: string) {
  const safe = query.trim().replace(/[%_]/g, " ").replace(/\s+/g, " ").trim()
  return `%${safe}%`
}

export function parseLeadStatusFilter(value: string | undefined): LeadStatusFilter {
  if (value && LEAD_STATUSES.has(value as LeadStatus)) {
    return value as LeadStatus
  }
  return "all"
}

export function parseLeadsListFilters(options: {
  q?: string
  source?: string
  assigned?: string
  minScore?: string
}): LeadsListFilters {
  return {
    q: options.q?.trim() ?? "",
    source: options.source?.trim() ?? "",
    assigned: options.assigned?.trim() ?? "",
    minScore: options.minScore?.trim() ?? "",
  }
}

async function getLeadListStats(): Promise<LeadListStats> {
  const supabase = createAdminClient()

  const [totalResult, newResult, contactedResult, qualifiedResult, convertedResult, lostResult] =
    await Promise.all([
      supabase.from("crm_leads").select("id", { count: "exact", head: true }),
      supabase
        .from("crm_leads")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
      supabase
        .from("crm_leads")
        .select("id", { count: "exact", head: true })
        .eq("status", "contacted"),
      supabase
        .from("crm_leads")
        .select("id", { count: "exact", head: true })
        .eq("status", "qualified"),
      supabase
        .from("crm_leads")
        .select("id", { count: "exact", head: true })
        .eq("status", "converted"),
      supabase
        .from("crm_leads")
        .select("id", { count: "exact", head: true })
        .eq("status", "lost"),
    ])

  return {
    total: totalResult.count ?? 0,
    newCount: newResult.count ?? 0,
    contacted: contactedResult.count ?? 0,
    qualified: qualifiedResult.count ?? 0,
    converted: convertedResult.count ?? 0,
    lost: lostResult.count ?? 0,
  }
}

function applyLeadsListFilters<
  T extends {
    eq: (column: string, value: string | number) => T
    gte: (column: string, value: number) => T
    or: (filters: string) => T
  },
>(query: T, statusFilter: LeadStatusFilter, listFilters: LeadsListFilters) {
  let next = query

  if (statusFilter !== "all") {
    next = next.eq("status", statusFilter)
  }

  if (listFilters.source) {
    next = next.eq("source", listFilters.source)
  }

  if (listFilters.assigned) {
    next = next.eq("assigned_to", listFilters.assigned)
  }

  if (listFilters.minScore) {
    const minScore = Number(listFilters.minScore)
    if (Number.isFinite(minScore)) {
      next = next.gte("score", minScore)
    }
  }

  if (listFilters.q) {
    const pattern = `"${toIlikePattern(listFilters.q)}"`
    next = next.or(
      `full_name.ilike.${pattern},email.ilike.${pattern},company.ilike.${pattern},address.ilike.${pattern},source.ilike.${pattern},phone.ilike.${pattern},assigned_to.ilike.${pattern},niche_hashtag.ilike.${pattern},gap_found.ilike.${pattern},profile_link.ilike.${pattern}`
    )
  }

  return next
}

export async function getLeadsPageData(options: {
  page?: string
  status?: string
  q?: string
  source?: string
  assigned?: string
  minScore?: string
  pageSize?: number
}): Promise<LeadsPageData> {
  const pageSize = options.pageSize ?? DEFAULT_ADMIN_PAGE_SIZE
  const statusFilter = parseLeadStatusFilter(options.status)
  const listFilters = parseLeadsListFilters(options)
  const requestedPage = parseAdminPage(options.page)

  const supabase = createAdminClient()

  let countQuery = supabase
    .from("crm_leads")
    .select("id", { count: "exact", head: true })

  countQuery = applyLeadsListFilters(countQuery, statusFilter, listFilters)

  const { count: filteredTotal, error: countError } = await countQuery

  if (countError) {
    throw countError
  }

  const total = filteredTotal ?? 0
  const paginationMeta = getAdminPaginationMeta(requestedPage, pageSize, total)
  const { from, to } = getAdminRange(paginationMeta.page, pageSize)

  let dataQuery = supabase
    .from("crm_leads")
    .select(LEAD_SELECT)
    .order("created_at", { ascending: false })
    .range(from, to)

  dataQuery = applyLeadsListFilters(dataQuery, statusFilter, listFilters)

  const [{ data, error: dataError }, stats] = await Promise.all([
    dataQuery,
    getLeadListStats(),
  ])

  if (dataError) {
    throw dataError
  }

  const leads = await attachNotesAndActivitiesToLeads((data ?? []) as CrmLeadRow[])

  return {
    leads,
    pagination: paginationMeta,
    stats,
    statusFilter,
    listFilters,
  }
}
