import "server-only"

import {
  formatStudentDate,
  isStudentStatus,
  parseStudentStatusFilter,
  STUDENT_STATUS_LABELS,
  type StudentListStats,
  type StudentStatus,
  type StudentStatusFilter,
  type StudentView,
} from "@/lib/academy/student-types"
import {
  DEFAULT_ADMIN_PAGE_SIZE,
  getAdminPaginationMeta,
  getAdminRange,
  getWeekStartIso,
  parseAdminPage,
  type AdminPaginationMeta,
} from "@/lib/admin/pagination"
import { getFinancePaymentIdsForCourseRegistrations } from "@/lib/crm/record-training-payment"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/types/database"

export type AcademyStudentRow =
  Database["public"]["Tables"]["academy_students"]["Row"]

export type StudentsPageData = {
  students: StudentView[]
  pagination: AdminPaginationMeta
  stats: StudentListStats
  statusFilter: StudentStatusFilter
}

const SELECT_COLUMNS =
  "id, first_name, last_name, email, phone, course_slug, course_title, course_key, registration_type, school_name, location, course_registration_id, pif_application_id, status, enrolled_at, notes, created_at, updated_at"

function mapStudentRow(
  row: AcademyStudentRow,
  financePaymentId: string | null
): StudentView {
  const status = isStudentStatus(row.status) ? row.status : "enrolled"
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: `${row.first_name} ${row.last_name}`.trim(),
    email: row.email,
    phone: row.phone,
    courseSlug: row.course_slug,
    courseTitle: row.course_title,
    courseKey: row.course_key,
    registrationType: row.registration_type,
    schoolName: row.school_name,
    location: row.location,
    courseRegistrationId: row.course_registration_id,
    pifApplicationId: row.pif_application_id,
    status,
    statusLabel: STUDENT_STATUS_LABELS[status],
    enrolledAt: row.enrolled_at,
    enrolledAtLabel: formatStudentDate(row.enrolled_at),
    notes: row.notes,
    financePaymentId,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function getStudentStats(): Promise<StudentListStats> {
  const supabase = createAdminClient()
  const weekStart = getWeekStartIso()

  const [totalResult, enrolledResult, activeResult, weekResult] =
    await Promise.all([
      supabase
        .from("academy_students")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("academy_students")
        .select("id", { count: "exact", head: true })
        .eq("status", "enrolled"),
      supabase
        .from("academy_students")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("academy_students")
        .select("id", { count: "exact", head: true })
        .gte("created_at", weekStart),
    ])

  return {
    total: totalResult.count ?? 0,
    enrolled: enrolledResult.count ?? 0,
    active: activeResult.count ?? 0,
    thisWeek: weekResult.count ?? 0,
  }
}

export async function getStudentsPageData(options: {
  page?: string
  status?: string
  pageSize?: number
}): Promise<StudentsPageData> {
  const pageSize = options.pageSize ?? DEFAULT_ADMIN_PAGE_SIZE
  const statusFilter = parseStudentStatusFilter(options.status)
  const requestedPage = parseAdminPage(options.page)
  const supabase = createAdminClient()

  let countQuery = supabase
    .from("academy_students")
    .select("id", { count: "exact", head: true })

  if (statusFilter !== "all") {
    countQuery = countQuery.eq("status", statusFilter)
  }

  const { count: filteredTotal, error: countError } = await countQuery
  if (countError) throw countError

  const total = filteredTotal ?? 0
  const paginationMeta = getAdminPaginationMeta(requestedPage, pageSize, total)
  const { from, to } = getAdminRange(paginationMeta.page, pageSize)

  let dataQuery = supabase
    .from("academy_students")
    .select(SELECT_COLUMNS)
    .order("created_at", { ascending: false })
    .range(from, to)

  if (statusFilter !== "all") {
    dataQuery = dataQuery.eq("status", statusFilter)
  }

  const [{ data, error: dataError }, stats] = await Promise.all([
    dataQuery,
    getStudentStats(),
  ])

  if (dataError) throw dataError

  const rows = data ?? []
  const registrationIds = rows
    .map((row) => row.course_registration_id)
    .filter(Boolean) as string[]
  const financeIds =
    await getFinancePaymentIdsForCourseRegistrations(registrationIds)

  return {
    students: rows.map((row) =>
      mapStudentRow(
        row,
        row.course_registration_id
          ? (financeIds.get(row.course_registration_id) ?? null)
          : null
      )
    ),
    pagination: paginationMeta,
    stats,
    statusFilter,
  }
}

export async function createStudentFromCourseRegistration(
  registrationId: string
) {
  const supabase = createAdminClient()

  const { data: existing, error: existingError } = await supabase
    .from("academy_students")
    .select(SELECT_COLUMNS)
    .eq("course_registration_id", registrationId)
    .maybeSingle()

  if (existingError) {
    if (existingError.message?.includes("academy_students")) {
      throw new Error(
        "Run supabase/academy-students.sql in Supabase first."
      )
    }
    throw existingError
  }

  if (existing) {
    return mapStudentRow(existing, null)
  }

  const { data: registration, error: registrationError } = await supabase
    .from("course_registrations")
    .select(
      "id, first_name, last_name, email, phone, school_name, course_slug, course_title, course_key, registration_type, location, created_at"
    )
    .eq("id", registrationId)
    .maybeSingle()

  if (registrationError) throw registrationError
  if (!registration) {
    throw new Error("Registration not found.")
  }

  const now = new Date().toISOString()
  const enrolledAt = registration.created_at.slice(0, 10)

  const { data, error } = await supabase
    .from("academy_students")
    .insert({
      first_name: registration.first_name,
      last_name: registration.last_name,
      email: registration.email,
      phone: registration.phone ?? "",
      course_slug: registration.course_slug ?? "",
      course_title: registration.course_title ?? "",
      course_key: registration.course_key ?? "",
      registration_type: registration.registration_type ?? "course",
      school_name: registration.school_name ?? "",
      location: registration.location ?? "",
      course_registration_id: registration.id,
      status: "enrolled",
      enrolled_at: enrolledAt,
      notes: "",
      updated_at: now,
    })
    .select(SELECT_COLUMNS)
    .single()

  if (error || !data) {
    if (error?.message?.includes("academy_students")) {
      throw new Error(
        "Run supabase/academy-students.sql in Supabase first."
      )
    }
    if (error?.message?.includes("duplicate key")) {
      const { data: again } = await supabase
        .from("academy_students")
        .select(SELECT_COLUMNS)
        .eq("course_registration_id", registrationId)
        .maybeSingle()
      if (again) return mapStudentRow(again, null)
    }
    throw error ?? new Error("Unable to create student.")
  }

  return mapStudentRow(data, null)
}

export async function updateStudent(
  id: string,
  input: {
    status?: StudentStatus
    notes?: string
    enrolledAt?: string
  }
) {
  const supabase = createAdminClient()
  const patch: Database["public"]["Tables"]["academy_students"]["Update"] = {
    updated_at: new Date().toISOString(),
  }

  if (input.status !== undefined) patch.status = input.status
  if (input.notes !== undefined) patch.notes = input.notes
  if (input.enrolledAt !== undefined) patch.enrolled_at = input.enrolledAt

  const { data, error } = await supabase
    .from("academy_students")
    .update(patch)
    .eq("id", id)
    .select(SELECT_COLUMNS)
    .single()

  if (error || !data) {
    throw error ?? new Error("Unable to update student.")
  }

  const financeId = data.course_registration_id
    ? (
        await getFinancePaymentIdsForCourseRegistrations([
          data.course_registration_id,
        ])
      ).get(data.course_registration_id) ?? null
    : null

  return mapStudentRow(data, financeId)
}

export async function deleteStudent(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("academy_students").delete().eq("id", id)
  if (error) throw error
}
