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

export type ContactSubmissionRow =
  Database["public"]["Tables"]["contact_submissions"]["Row"]

const SELECT_COLUMNS =
  "id, first_name, last_name, email, phone, message, status, created_at"

export type ContactListStats = {
  total: number
  newCount: number
  thisWeek: number
  responded: number
}

export type ContactSubmissionsPageData = {
  submissions: ContactSubmissionRow[]
  pagination: AdminPaginationMeta
  stats: ContactListStats
  statusFilter: AdminStatusFilter
}

async function getContactSubmissionStats(): Promise<ContactListStats> {
  const supabase = createAdminClient()
  const weekStart = getWeekStartIso()

  const [totalResult, newResult, weekResult, readResult, repliedResult] =
    await Promise.all([
      supabase
        .from("contact_submissions")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("contact_submissions")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
      supabase
        .from("contact_submissions")
        .select("id", { count: "exact", head: true })
        .gte("created_at", weekStart),
      supabase
        .from("contact_submissions")
        .select("id", { count: "exact", head: true })
        .eq("status", "read"),
      supabase
        .from("contact_submissions")
        .select("id", { count: "exact", head: true })
        .eq("status", "replied"),
    ])

  return {
    total: totalResult.count ?? 0,
    newCount: newResult.count ?? 0,
    thisWeek: weekResult.count ?? 0,
    responded: (readResult.count ?? 0) + (repliedResult.count ?? 0),
  }
}

export async function getContactSubmissionsPageData(options: {
  page?: string
  status?: string
  pageSize?: number
}): Promise<ContactSubmissionsPageData> {
  const pageSize = options.pageSize ?? DEFAULT_ADMIN_PAGE_SIZE
  const statusFilter = parseAdminStatusFilter(options.status)
  const requestedPage = parseAdminPage(options.page)

  const supabase = createAdminClient()

  let countQuery = supabase
    .from("contact_submissions")
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
    .from("contact_submissions")
    .select(SELECT_COLUMNS)
    .order("created_at", { ascending: false })
    .range(from, to)

  if (statusFilter !== "all") {
    dataQuery = dataQuery.eq("status", statusFilter)
  }

  const [{ data, error: dataError }, stats] = await Promise.all([
    dataQuery,
    getContactSubmissionStats(),
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
