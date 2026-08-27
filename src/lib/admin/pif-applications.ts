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
import { getRegistrationReceiptSignedUrl } from "@/lib/registrations/receipt-upload"
import { getFinancePaymentIdsForPifApplications } from "@/lib/crm/record-training-payment"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/types/database"

export type PifApplicationRow =
  Database["public"]["Tables"]["pif_applications"]["Row"]

export type PifApplicationWithReceipt = PifApplicationRow & {
  payment_receipt_url: string | null
  finance_payment_id: string | null
}

const SELECT_COLUMNS =
  "id, first_name, last_name, email, phone, education_experience, preferred_track, portfolio_url, motivation, goals, program_commitment_agreed, payment_receipt_path, status, created_at"

export type PifListStats = {
  total: number
  newCount: number
  thisWeek: number
  reviewed: number
}

export type PifApplicationsPageData = {
  applications: PifApplicationWithReceipt[]
  pagination: AdminPaginationMeta
  stats: PifListStats
  statusFilter: AdminStatusFilter
}

async function getPifApplicationStats(): Promise<PifListStats> {
  const supabase = createAdminClient()
  const weekStart = getWeekStartIso()

  const [totalResult, newResult, weekResult, readResult, repliedResult] =
    await Promise.all([
      supabase
        .from("pif_applications")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("pif_applications")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
      supabase
        .from("pif_applications")
        .select("id", { count: "exact", head: true })
        .gte("created_at", weekStart),
      supabase
        .from("pif_applications")
        .select("id", { count: "exact", head: true })
        .eq("status", "read"),
      supabase
        .from("pif_applications")
        .select("id", { count: "exact", head: true })
        .eq("status", "replied"),
    ])

  return {
    total: totalResult.count ?? 0,
    newCount: newResult.count ?? 0,
    thisWeek: weekResult.count ?? 0,
    reviewed: (readResult.count ?? 0) + (repliedResult.count ?? 0),
  }
}

async function attachReceiptUrls(
  rows: PifApplicationRow[]
): Promise<PifApplicationWithReceipt[]> {
  const financeIds = await getFinancePaymentIdsForPifApplications(
    rows.map((row) => row.id)
  )

  return Promise.all(
    rows.map(async (application) => {
      const finance_payment_id = financeIds.get(application.id) ?? null

      if (!application.payment_receipt_path) {
        return {
          ...application,
          payment_receipt_url: null,
          finance_payment_id,
        }
      }

      const payment_receipt_url = await getRegistrationReceiptSignedUrl(
        application.payment_receipt_path
      )

      return { ...application, payment_receipt_url, finance_payment_id }
    })
  )
}

export async function getPifApplicationsPageData(options: {
  page?: string
  status?: string
  pageSize?: number
}): Promise<PifApplicationsPageData> {
  const pageSize = options.pageSize ?? DEFAULT_ADMIN_PAGE_SIZE
  const statusFilter = parseAdminStatusFilter(options.status)
  const requestedPage = parseAdminPage(options.page)

  const supabase = createAdminClient()

  let countQuery = supabase
    .from("pif_applications")
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
    .from("pif_applications")
    .select(SELECT_COLUMNS)
    .order("created_at", { ascending: false })
    .range(from, to)

  if (statusFilter !== "all") {
    dataQuery = dataQuery.eq("status", statusFilter)
  }

  const [{ data, error: dataError }, stats] = await Promise.all([
    dataQuery,
    getPifApplicationStats(),
  ])

  if (dataError) {
    throw dataError
  }

  const applications = await attachReceiptUrls(data ?? [])

  return {
    applications,
    pagination: paginationMeta,
    stats,
    statusFilter,
  }
}
