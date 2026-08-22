import "server-only"

import {
  DEFAULT_ADMIN_PAGE_SIZE,
  getAdminPaginationMeta,
  getAdminRange,
  getWeekStartIso,
  parseAdminExtendedStatusFilter,
  parseAdminPage,
  type AdminExtendedStatusFilter,
  type AdminPaginationMeta,
} from "@/lib/admin/pagination"
import { getRegistrationReceiptSignedUrl } from "@/lib/registrations/receipt-upload"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/types/database"

export type CourseRegistrationRow =
  Database["public"]["Tables"]["course_registrations"]["Row"]

export type CourseRegistrationWithReceipt = CourseRegistrationRow & {
  payment_receipt_url: string | null
}

const SELECT_COLUMNS =
  "id, first_name, last_name, email, phone, school_id, school_name, course_slug, course_title, course_key, message, registration_type, status, location, has_working_computer, can_devote_6_hours_weekly, payment_receipt_path, created_at"

export type RegistrationListStats = {
  total: number
  newCount: number
  thisWeek: number
  responded: number
}

export type CourseRegistrationsPageData = {
  registrations: CourseRegistrationWithReceipt[]
  pagination: AdminPaginationMeta
  stats: RegistrationListStats
  statusFilter: AdminExtendedStatusFilter
}

const REGISTRATION_STATUS_FILTERS = [
  "all",
  "new",
  "read",
  "replied",
  "converted",
] as const

export { REGISTRATION_STATUS_FILTERS }

async function getCourseRegistrationStats(): Promise<RegistrationListStats> {
  const supabase = createAdminClient()
  const weekStart = getWeekStartIso()

  const [totalResult, newResult, weekResult, readResult, repliedResult] =
    await Promise.all([
      supabase
        .from("course_registrations")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("course_registrations")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
      supabase
        .from("course_registrations")
        .select("id", { count: "exact", head: true })
        .gte("created_at", weekStart),
      supabase
        .from("course_registrations")
        .select("id", { count: "exact", head: true })
        .eq("status", "read"),
      supabase
        .from("course_registrations")
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

async function attachReceiptUrls(
  rows: CourseRegistrationRow[]
): Promise<CourseRegistrationWithReceipt[]> {
  return Promise.all(
    rows.map(async (registration) => {
      if (!registration.payment_receipt_path) {
        return { ...registration, payment_receipt_url: null }
      }

      const payment_receipt_url = await getRegistrationReceiptSignedUrl(
        registration.payment_receipt_path
      )

      return { ...registration, payment_receipt_url }
    })
  )
}

export async function getCourseRegistrationsPageData(options: {
  page?: string
  status?: string
  pageSize?: number
}): Promise<CourseRegistrationsPageData> {
  const pageSize = options.pageSize ?? DEFAULT_ADMIN_PAGE_SIZE
  const statusFilter = parseAdminExtendedStatusFilter(options.status)
  const requestedPage = parseAdminPage(options.page)

  const supabase = createAdminClient()

  let countQuery = supabase
    .from("course_registrations")
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
    .from("course_registrations")
    .select(SELECT_COLUMNS)
    .order("created_at", { ascending: false })
    .range(from, to)

  if (statusFilter !== "all") {
    dataQuery = dataQuery.eq("status", statusFilter)
  }

  const [{ data, error: dataError }, stats] = await Promise.all([
    dataQuery,
    getCourseRegistrationStats(),
  ])

  if (dataError) {
    throw dataError
  }

  const registrations = await attachReceiptUrls(data ?? [])

  return {
    registrations,
    pagination: paginationMeta,
    stats,
    statusFilter,
  }
}
