import "server-only"

import {
  getStaffAccentClass,
  getStaffInitials,
  isDocumentType,
  isPaymentFrequency,
  isSalaryCurrency,
  isStaffGender,
  isStaffRole,
  isStaffStatus,
  type TeamMemberDocumentView,
  type TeamMemberView,
} from "@/lib/team/team-types"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import type { Database } from "@/types/database"

export type {
  StaffRole,
  StaffStatus,
  TeamMemberDocumentView,
  TeamMemberView,
} from "@/lib/team/team-types"

export {
  DOCUMENT_TYPES,
  PAYMENT_FREQUENCIES,
  SALARY_CURRENCIES,
  STAFF_GENDERS,
  STAFF_ROLES,
  STAFF_STATUSES,
  formatSalaryAmount,
  getAgeFromDateOfBirth,
  getNextBirthdayLabel,
  getStaffAccentClass,
  getStaffInitials,
  isStaffRole,
  isStaffStatus,
} from "@/lib/team/team-types"

export type TeamMemberRow = Database["public"]["Tables"]["team_members"]["Row"]
export type TeamMemberDocumentRow =
  Database["public"]["Tables"]["team_member_documents"]["Row"]

const MEMBER_SELECT =
  "id, full_name, email, phone, role, department, status, joined_at, gender, address, date_of_birth, base_salary, salary_currency, payment_frequency, bank_name, account_name, account_number, created_at, updated_at"

const DOCUMENT_SELECT = "id, member_id, title, doc_type, notes, created_at"

export function mapTeamMemberDocumentRow(
  row: TeamMemberDocumentRow
): TeamMemberDocumentView {
  return {
    id: row.id,
    title: row.title,
    docType: isDocumentType(row.doc_type) ? row.doc_type : "Other",
    notes: row.notes?.trim() || "",
    createdAt: row.created_at,
  }
}

export function mapTeamMemberRowToView(
  row: TeamMemberRow,
  documents: TeamMemberDocumentRow[] = []
): TeamMemberView {
  const baseSalary =
    row.base_salary == null
      ? null
      : typeof row.base_salary === "number"
        ? row.base_salary
        : Number(row.base_salary)

  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone?.trim() || "—",
    role: isStaffRole(row.role) ? row.role : "Other",
    department: row.department,
    status: isStaffStatus(row.status) ? row.status : "active",
    joinedAt: row.joined_at,
    gender: row.gender && isStaffGender(row.gender) ? row.gender : null,
    address: row.address?.trim() || "",
    dateOfBirth: row.date_of_birth,
    baseSalary:
      baseSalary == null || Number.isNaN(baseSalary) ? null : baseSalary,
    salaryCurrency: isSalaryCurrency(row.salary_currency)
      ? row.salary_currency
      : "NGN",
    paymentFrequency:
      row.payment_frequency && isPaymentFrequency(row.payment_frequency)
        ? row.payment_frequency
        : null,
    bankName: row.bank_name?.trim() || "",
    accountName: row.account_name?.trim() || "",
    accountNumber: row.account_number?.trim() || "",
    documents: documents.map(mapTeamMemberDocumentRow),
    initials: getStaffInitials(row.full_name),
    accent: getStaffAccentClass(row.id),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function loadDocumentsByMemberIds(memberIds: string[]) {
  if (memberIds.length === 0) {
    return new Map<string, TeamMemberDocumentRow[]>()
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("team_member_documents")
    .select(DOCUMENT_SELECT)
    .in("member_id", memberIds)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to load team member documents", error)
    return new Map<string, TeamMemberDocumentRow[]>()
  }

  const documentsByMember = new Map<string, TeamMemberDocumentRow[]>()
  for (const document of data ?? []) {
    const list = documentsByMember.get(document.member_id) ?? []
    list.push(document)
    documentsByMember.set(document.member_id, list)
  }
  return documentsByMember
}

export async function getAllTeamMembers(): Promise<TeamMemberView[]> {
  if (!isSupabaseConfigured()) return []

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("team_members")
    .select(MEMBER_SELECT)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to load team members", error)
    throw error
  }

  const members = data ?? []
  if (members.length === 0) return []

  const documentsByMember = await loadDocumentsByMemberIds(
    members.map((member) => member.id)
  )

  return members.map((member) =>
    mapTeamMemberRowToView(member, documentsByMember.get(member.id) ?? [])
  )
}

export async function getTeamMemberById(
  id: string
): Promise<TeamMemberView | null> {
  if (!isSupabaseConfigured()) return null

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("team_members")
    .select(MEMBER_SELECT)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("Failed to load team member", error)
    throw error
  }

  if (!data) return null

  const documentsByMember = await loadDocumentsByMemberIds([id])
  return mapTeamMemberRowToView(data, documentsByMember.get(id) ?? [])
}
