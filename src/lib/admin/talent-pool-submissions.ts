import "server-only"

import {
  DEFAULT_ADMIN_PAGE_SIZE,
  getAdminPaginationMeta,
  getAdminRange,
  getWeekStartIso,
  parseAdminPage,
  parseAdminStatusFilter,
  type AdminListStats,
  type AdminPaginationMeta,
  type AdminStatusFilter,
} from "@/lib/admin/pagination"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/types/database"

export type TalentPoolSubmissionRow =
  Database["public"]["Tables"]["talent_pool_submissions"]["Row"]

const SELECT_COLUMNS =
  "id, full_name, email, phone, location, linkedin_url, github_url, portfolio_url, cv_path, interest_areas, years_of_experience, expected_salary, message, availability, status, created_at"

export type TalentPoolPageData = {
  submissions: TalentPoolSubmissionRow[]
  pagination: AdminPaginationMeta
  stats: AdminListStats
  statusFilter: AdminStatusFilter
}

async function getTalentPoolStats(): Promise<AdminListStats> {
  const supabase = createAdminClient()
  const weekStart = getWeekStartIso()

  const [totalResult, newResult, weekResult, repliedResult] = await Promise.all([
    supabase
      .from("talent_pool_submissions")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("talent_pool_submissions")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("talent_pool_submissions")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekStart),
    supabase
      .from("talent_pool_submissions")
      .select("id", { count: "exact", head: true })
      .eq("status", "replied"),
  ])

  return {
    total: totalResult.count ?? 0,
    newCount: newResult.count ?? 0,
    thisWeek: weekResult.count ?? 0,
    replied: repliedResult.count ?? 0,
  }
}

export async function getTalentPoolPageData(options: {
  page?: string
  status?: string
  pageSize?: number
}): Promise<TalentPoolPageData> {
  const pageSize = options.pageSize ?? DEFAULT_ADMIN_PAGE_SIZE
  const statusFilter = parseAdminStatusFilter(options.status)
  const requestedPage = parseAdminPage(options.page)

  const supabase = createAdminClient()

  let countQuery = supabase
    .from("talent_pool_submissions")
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
    .from("talent_pool_submissions")
    .select(SELECT_COLUMNS)
    .order("created_at", { ascending: false })
    .range(from, to)

  if (statusFilter !== "all") {
    dataQuery = dataQuery.eq("status", statusFilter)
  }

  const [{ data, error: dataError }, stats] = await Promise.all([
    dataQuery,
    getTalentPoolStats(),
  ])

  if (dataError) {
    throw dataError
  }

  return {
    submissions: data ?? [],
    pagination: paginationMeta,
    stats,
    statusFilter,
  }
}
