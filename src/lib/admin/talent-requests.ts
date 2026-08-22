import "server-only"

import {
  DEFAULT_ADMIN_PAGE_SIZE,
  getAdminPaginationMeta,
  getAdminRange,
  getWeekStartIso,
  parseAdminPage,
  parseAdminStatusFilter,
  type AdminPaginationMeta,
  type AdminStatusFilter,
} from "@/lib/admin/pagination"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/types/database"

export type TalentRequestRow =
  Database["public"]["Tables"]["talent_requests"]["Row"]

const SELECT_COLUMNS =
  "id, first_name, last_name, email, phone, company, role_needed, engagement_type, headcount, duration, details, status, created_at"

export type TalentRequestListStats = {
  total: number
  newCount: number
  thisWeek: number
  headcount: number
}

export type TalentRequestsPageData = {
  requests: TalentRequestRow[]
  pagination: AdminPaginationMeta
  stats: TalentRequestListStats
  statusFilter: AdminStatusFilter
}

async function getTalentRequestStats(): Promise<TalentRequestListStats> {
  const supabase = createAdminClient()
  const weekStart = getWeekStartIso()

  const [totalResult, newResult, weekResult, headcountResult] =
    await Promise.all([
      supabase
        .from("talent_requests")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("talent_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
      supabase
        .from("talent_requests")
        .select("id", { count: "exact", head: true })
        .gte("created_at", weekStart),
      supabase.from("talent_requests").select("headcount"),
    ])

  const headcount = (headcountResult.data ?? []).reduce(
    (sum, row) => sum + row.headcount,
    0
  )

  return {
    total: totalResult.count ?? 0,
    newCount: newResult.count ?? 0,
    thisWeek: weekResult.count ?? 0,
    headcount,
  }
}

export async function getTalentRequestsPageData(options: {
  page?: string
  status?: string
  pageSize?: number
}): Promise<TalentRequestsPageData> {
  const pageSize = options.pageSize ?? DEFAULT_ADMIN_PAGE_SIZE
  const statusFilter = parseAdminStatusFilter(options.status)
  const requestedPage = parseAdminPage(options.page)

  const supabase = createAdminClient()

  let countQuery = supabase
    .from("talent_requests")
    .select("id", { count: "exact", head: true })

  if (statusFilter !== "all") {
    countQuery = countQuery.eq("status", statusFilter)
  }

  const { count: filteredTotal, error: countError } = await countQuery

  if (countError) {
    throw countError
  }

  const total = filteredTotal ?? 0
  const paginationMeta = getAdminPaginationMeta(requestedPage, pageSize, total)
  const { from, to } = getAdminRange(paginationMeta.page, pageSize)

  let dataQuery = supabase
    .from("talent_requests")
    .select(SELECT_COLUMNS)
    .order("created_at", { ascending: false })
    .range(from, to)

  if (statusFilter !== "all") {
    dataQuery = dataQuery.eq("status", statusFilter)
  }

  const [{ data, error: dataError }, stats] = await Promise.all([
    dataQuery,
    getTalentRequestStats(),
  ])

  if (dataError) {
    throw dataError
  }

  return {
    requests: data ?? [],
    pagination: paginationMeta,
    stats,
    statusFilter,
  }
}
