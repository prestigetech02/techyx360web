import "server-only"

import { touchClientActivity } from "@/lib/crm/clients"
import { syncInvoiceStatusFromPayments } from "@/lib/invoices/payment-link"
import {
  formatPaymentDate,
  isPaymentDirection,
  isPaymentMethod,
  isPaymentPurpose,
  isPaymentStatus,
  PAYMENT_METHOD_LABELS,
  PAYMENT_PURPOSE_LABELS,
  PAYMENT_STATUS_LABELS,
  type PaymentDirection,
  type PaymentMethod,
  type PaymentPurpose,
  type PaymentStatus,
  type PaymentView,
} from "@/lib/crm/payment-types"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/types/database"

export type CrmPaymentRow = Database["public"]["Tables"]["crm_payments"]["Row"]

function mapPaymentRow(
  row: CrmPaymentRow,
  extras: {
    clientName: string | null
    invoiceNumber: string | null
    dealTitle: string | null
  }
): PaymentView {
  const method = isPaymentMethod(row.method) ? row.method : "other"
  const status = isPaymentStatus(row.status) ? row.status : "completed"
  const direction = isPaymentDirection(row.direction)
    ? row.direction
    : "inbound"
  const purpose = isPaymentPurpose(row.purpose) ? row.purpose : "others"

  return {
    id: row.id,
    clientId: row.client_id,
    clientName: extras.clientName,
    invoiceId: row.invoice_id,
    invoiceNumber: extras.invoiceNumber,
    dealId: row.deal_id,
    dealTitle: extras.dealTitle,
    courseRegistrationId: row.course_registration_id ?? null,
    pifApplicationId: row.pif_application_id ?? null,
    amount: Number(row.amount),
    currency: row.currency,
    direction,
    method,
    methodLabel: PAYMENT_METHOD_LABELS[method],
    status,
    statusLabel: PAYMENT_STATUS_LABELS[status],
    purpose,
    purposeLabel: PAYMENT_PURPOSE_LABELS[purpose],
    paidAt: row.paid_at,
    paidAtLabel: formatPaymentDate(row.paid_at),
    reference: row.reference,
    description: row.description,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function loadPaymentExtras(rows: CrmPaymentRow[]) {
  const supabase = createAdminClient()
  const clientIds = [
    ...new Set(rows.map((row) => row.client_id).filter(Boolean) as string[]),
  ]
  const invoiceIds = [
    ...new Set(rows.map((row) => row.invoice_id).filter(Boolean) as string[]),
  ]
  const dealIds = [
    ...new Set(rows.map((row) => row.deal_id).filter(Boolean) as string[]),
  ]

  const clientNames = new Map<string, string>()
  const invoiceNumbers = new Map<string, string>()
  const dealTitles = new Map<string, string>()

  const [clientsResult, invoicesResult, dealsResult] = await Promise.all([
    clientIds.length
      ? supabase.from("crm_clients").select("id, company").in("id", clientIds)
      : Promise.resolve({ data: [], error: null }),
    invoiceIds.length
      ? supabase
          .from("invoices")
          .select("id, invoice_number")
          .in("id", invoiceIds)
      : Promise.resolve({ data: [], error: null }),
    dealIds.length
      ? supabase.from("crm_deals").select("id, title").in("id", dealIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (clientsResult.error) {
    console.error("Failed to load payment clients", clientsResult.error)
  } else {
    for (const client of clientsResult.data ?? []) {
      clientNames.set(client.id, client.company)
    }
  }

  if (invoicesResult.error) {
    console.error("Failed to load payment invoices", invoicesResult.error)
  } else {
    for (const invoice of invoicesResult.data ?? []) {
      invoiceNumbers.set(invoice.id, invoice.invoice_number)
    }
  }

  if (dealsResult.error) {
    console.error("Failed to load payment deals", dealsResult.error)
  } else {
    for (const deal of dealsResult.data ?? []) {
      dealTitles.set(deal.id, deal.title)
    }
  }

  return { clientNames, invoiceNumbers, dealTitles }
}

function mapRows(rows: CrmPaymentRow[]) {
  return loadPaymentExtras(rows).then(
    ({ clientNames, invoiceNumbers, dealTitles }) =>
      rows.map((row) =>
        mapPaymentRow(row, {
          clientName: row.client_id
            ? (clientNames.get(row.client_id) ?? null)
            : null,
          invoiceNumber: row.invoice_id
            ? (invoiceNumbers.get(row.invoice_id) ?? null)
            : null,
          dealTitle: row.deal_id ? (dealTitles.get(row.deal_id) ?? null) : null,
        })
      )
  )
}

export async function getAllPayments() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crm_payments")
    .select("*")
    .order("paid_at", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) throw error
  return mapRows(data ?? [])
}

export async function getPaymentsByClientId(clientId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crm_payments")
    .select("*")
    .eq("client_id", clientId)
    .order("paid_at", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) throw error
  return mapRows(data ?? [])
}

export async function getPaymentStats() {
  const payments = await getAllPayments()
  const completedInbound = payments.filter(
    (payment) =>
      payment.status === "completed" && payment.direction === "inbound"
  )
  const pending = payments.filter((payment) => payment.status === "pending")
  const received = completedInbound.reduce(
    (sum, payment) => sum + payment.amount,
    0
  )
  const pendingAmount = pending.reduce(
    (sum, payment) => sum + payment.amount,
    0
  )

  return {
    totalPayments: payments.length,
    received,
    pendingCount: pending.length,
    pendingAmount,
  }
}

export type CreatePaymentInput = {
  clientId?: string | null
  invoiceId?: string | null
  dealId?: string | null
  courseRegistrationId?: string | null
  pifApplicationId?: string | null
  amount: number
  direction?: PaymentDirection
  method: PaymentMethod
  status: PaymentStatus
  purpose: PaymentPurpose
  paidAt: string
  reference?: string
  description?: string
  notes?: string
}

export async function createPayment(input: CreatePaymentInput) {
  const supabase = createAdminClient()
  const now = new Date().toISOString()

  const insert: Database["public"]["Tables"]["crm_payments"]["Insert"] = {
    client_id: input.clientId || null,
    invoice_id: input.invoiceId || null,
    deal_id: input.dealId || null,
    amount: input.amount,
    direction: input.direction ?? "inbound",
    method: input.method,
    status: input.status,
    purpose: input.purpose,
    paid_at: input.paidAt,
    reference: input.reference ?? "",
    description: input.description ?? "",
    notes: input.notes ?? "",
    updated_at: now,
  }

  if (input.courseRegistrationId) {
    insert.course_registration_id = input.courseRegistrationId
  }
  if (input.pifApplicationId) {
    insert.pif_application_id = input.pifApplicationId
  }

  const { data, error } = await supabase
    .from("crm_payments")
    .insert(insert)
    .select("*")
    .single()

  if (error || !data) {
    throw error ?? new Error("Failed to create payment")
  }

  if (input.clientId) {
    await touchClientActivity(input.clientId)
  }

  if (input.invoiceId) {
    await syncInvoiceStatusFromPayments(input.invoiceId)
  }

  const [payment] = await mapRows([data])
  return payment
}

export type UpdatePaymentInput = Partial<{
  clientId: string | null
  invoiceId: string | null
  dealId: string | null
  amount: number
  direction: PaymentDirection
  method: PaymentMethod
  status: PaymentStatus
  purpose: PaymentPurpose
  paidAt: string
  reference: string
  description: string
  notes: string
}>

export async function updatePayment(id: string, input: UpdatePaymentInput) {
  const supabase = createAdminClient()
  const now = new Date().toISOString()

  const { data: existing } = await supabase
    .from("crm_payments")
    .select("invoice_id")
    .eq("id", id)
    .maybeSingle()

  const patch: Database["public"]["Tables"]["crm_payments"]["Update"] = {
    updated_at: now,
  }

  if (input.clientId !== undefined) patch.client_id = input.clientId
  if (input.invoiceId !== undefined) patch.invoice_id = input.invoiceId
  if (input.dealId !== undefined) patch.deal_id = input.dealId
  if (input.amount !== undefined) patch.amount = input.amount
  if (input.direction !== undefined) patch.direction = input.direction
  if (input.method !== undefined) patch.method = input.method
  if (input.status !== undefined) patch.status = input.status
  if (input.purpose !== undefined) patch.purpose = input.purpose
  if (input.paidAt !== undefined) patch.paid_at = input.paidAt
  if (input.reference !== undefined) patch.reference = input.reference
  if (input.description !== undefined) patch.description = input.description
  if (input.notes !== undefined) patch.notes = input.notes

  const { data, error } = await supabase
    .from("crm_payments")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single()

  if (error || !data) {
    throw error ?? new Error("Failed to update payment")
  }

  if (data.client_id) {
    await touchClientActivity(data.client_id)
  }

  const invoiceIds = new Set<string>()
  if (data.invoice_id) invoiceIds.add(data.invoice_id)
  if (existing?.invoice_id) invoiceIds.add(existing.invoice_id)

  for (const invoiceId of invoiceIds) {
    await syncInvoiceStatusFromPayments(invoiceId)
  }

  const [payment] = await mapRows([data])
  return payment
}

export async function deletePayment(id: string) {
  const supabase = createAdminClient()
  const { data: existing } = await supabase
    .from("crm_payments")
    .select("client_id, invoice_id")
    .eq("id", id)
    .maybeSingle()

  const { error } = await supabase.from("crm_payments").delete().eq("id", id)
  if (error) throw error

  if (existing?.client_id) {
    await touchClientActivity(existing.client_id)
  }

  if (existing?.invoice_id) {
    await syncInvoiceStatusFromPayments(existing.invoice_id)
  }
}
