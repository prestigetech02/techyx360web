import "server-only"

import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_METHOD_LABELS,
  EXPENSE_STATUS_LABELS,
  formatExpenseDate,
  isExpenseCategory,
  isExpenseMethod,
  isExpenseStatus,
  type ExpenseCategory,
  type ExpenseMethod,
  type ExpenseStatus,
  type ExpenseView,
} from "@/lib/crm/expense-types"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/types/database"

export type CrmExpenseRow = Database["public"]["Tables"]["crm_expenses"]["Row"]

function mapExpenseRow(
  row: CrmExpenseRow,
  extras: {
    clientName: string | null
    projectName: string | null
  }
): ExpenseView {
  const category = isExpenseCategory(row.category) ? row.category : "others"
  const method = isExpenseMethod(row.method) ? row.method : "other"
  const status = isExpenseStatus(row.status) ? row.status : "paid"

  return {
    id: row.id,
    clientId: row.client_id,
    clientName: extras.clientName,
    projectId: row.project_id,
    projectName: extras.projectName,
    amount: Number(row.amount),
    currency: row.currency,
    category,
    categoryLabel: EXPENSE_CATEGORY_LABELS[category],
    vendor: row.vendor,
    method,
    methodLabel: EXPENSE_METHOD_LABELS[method],
    status,
    statusLabel: EXPENSE_STATUS_LABELS[status],
    spentAt: row.spent_at,
    spentAtLabel: formatExpenseDate(row.spent_at),
    reference: row.reference,
    description: row.description,
    notes: row.notes,
    receiptUrl: row.receipt_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function loadExpenseExtras(rows: CrmExpenseRow[]) {
  const supabase = createAdminClient()
  const clientIds = [
    ...new Set(rows.map((row) => row.client_id).filter(Boolean) as string[]),
  ]
  const projectIds = [
    ...new Set(rows.map((row) => row.project_id).filter(Boolean) as string[]),
  ]

  const clientNames = new Map<string, string>()
  const projectNames = new Map<string, string>()

  const [clientsResult, projectsResult] = await Promise.all([
    clientIds.length
      ? supabase.from("crm_clients").select("id, company").in("id", clientIds)
      : Promise.resolve({ data: [], error: null }),
    projectIds.length
      ? supabase.from("crm_projects").select("id, name").in("id", projectIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (clientsResult.error) {
    console.error("Failed to load expense clients", clientsResult.error)
  } else {
    for (const client of clientsResult.data ?? []) {
      clientNames.set(client.id, client.company)
    }
  }

  if (projectsResult.error) {
    console.error("Failed to load expense projects", projectsResult.error)
  } else {
    for (const project of projectsResult.data ?? []) {
      projectNames.set(project.id, project.name)
    }
  }

  return { clientNames, projectNames }
}

function mapRows(rows: CrmExpenseRow[]) {
  return loadExpenseExtras(rows).then(({ clientNames, projectNames }) =>
    rows.map((row) =>
      mapExpenseRow(row, {
        clientName: row.client_id
          ? (clientNames.get(row.client_id) ?? null)
          : null,
        projectName: row.project_id
          ? (projectNames.get(row.project_id) ?? null)
          : null,
      })
    )
  )
}

export async function getAllExpenses() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crm_expenses")
    .select("*")
    .order("spent_at", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) throw error
  return mapRows(data ?? [])
}

export type CreateExpenseInput = {
  clientId?: string | null
  projectId?: string | null
  amount: number
  category: ExpenseCategory
  vendor?: string
  method: ExpenseMethod
  status: ExpenseStatus
  spentAt: string
  reference?: string
  description?: string
  notes?: string
  receiptUrl?: string
}

export async function createExpense(input: CreateExpenseInput) {
  const supabase = createAdminClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("crm_expenses")
    .insert({
      client_id: input.clientId || null,
      project_id: input.projectId || null,
      amount: input.amount,
      category: input.category,
      vendor: input.vendor ?? "",
      method: input.method,
      status: input.status,
      spent_at: input.spentAt,
      reference: input.reference ?? "",
      description: input.description ?? "",
      notes: input.notes ?? "",
      receipt_url: input.receiptUrl ?? "",
      updated_at: now,
    })
    .select("*")
    .single()

  if (error || !data) {
    throw error ?? new Error("Failed to create expense")
  }

  const [expense] = await mapRows([data])
  return expense
}

export type UpdateExpenseInput = Partial<{
  clientId: string | null
  projectId: string | null
  amount: number
  category: ExpenseCategory
  vendor: string
  method: ExpenseMethod
  status: ExpenseStatus
  spentAt: string
  reference: string
  description: string
  notes: string
  receiptUrl: string
}>

export async function updateExpense(id: string, input: UpdateExpenseInput) {
  const supabase = createAdminClient()
  const now = new Date().toISOString()

  const patch: Database["public"]["Tables"]["crm_expenses"]["Update"] = {
    updated_at: now,
  }

  if (input.clientId !== undefined) patch.client_id = input.clientId
  if (input.projectId !== undefined) patch.project_id = input.projectId
  if (input.amount !== undefined) patch.amount = input.amount
  if (input.category !== undefined) patch.category = input.category
  if (input.vendor !== undefined) patch.vendor = input.vendor
  if (input.method !== undefined) patch.method = input.method
  if (input.status !== undefined) patch.status = input.status
  if (input.spentAt !== undefined) patch.spent_at = input.spentAt
  if (input.reference !== undefined) patch.reference = input.reference
  if (input.description !== undefined) patch.description = input.description
  if (input.notes !== undefined) patch.notes = input.notes
  if (input.receiptUrl !== undefined) patch.receipt_url = input.receiptUrl

  const { data, error } = await supabase
    .from("crm_expenses")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single()

  if (error || !data) {
    throw error ?? new Error("Failed to update expense")
  }

  const [expense] = await mapRows([data])
  return expense
}

export async function deleteExpense(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("crm_expenses").delete().eq("id", id)
  if (error) throw error
}
