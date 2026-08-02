import "server-only"

import { asInvoiceStatus } from "@/lib/invoices/mappers"
import type { InvoicePaymentOption, InvoiceStatus } from "@/lib/invoices/types"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

async function getCompletedInboundPaidAmount(
  invoiceId: string
): Promise<number> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crm_payments")
    .select("amount")
    .eq("invoice_id", invoiceId)
    .eq("status", "completed")
    .eq("direction", "inbound")

  if (error) {
    console.error("Failed to sum invoice payments", error)
    return 0
  }

  return (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0)
}

export async function syncInvoiceStatusFromPayments(invoiceId: string) {
  if (!isSupabaseConfigured() || !invoiceId) return

  const supabase = createAdminClient()
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("id, total, status")
    .eq("id", invoiceId)
    .maybeSingle()

  if (error || !invoice) {
    if (error) console.error("Failed to load invoice for payment sync", error)
    return
  }

  const currentStatus = asInvoiceStatus(invoice.status)
  if (currentStatus === "cancelled") return

  const total = Number(invoice.total)
  const amountPaid = await getCompletedInboundPaidAmount(invoiceId)
  const epsilon = 0.009

  let nextStatus: InvoiceStatus = currentStatus

  if (amountPaid >= total - epsilon && total > 0) {
    nextStatus = "paid"
  } else if (amountPaid > epsilon) {
    nextStatus = currentStatus === "overdue" ? "overdue" : "partially_paid"
  } else if (currentStatus === "paid" || currentStatus === "partially_paid") {
    nextStatus = "sent"
  }

  if (nextStatus === currentStatus) return

  const { error: updateError } = await supabase
    .from("invoices")
    .update({
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", invoiceId)

  if (updateError) {
    console.error("Failed to sync invoice status from payments", updateError)
  }
}

export async function getInvoiceBalance(invoiceId: string, total: number) {
  if (!isSupabaseConfigured() || !invoiceId) {
    return Math.max(0, Number(total) || 0)
  }

  const amountPaid = await getCompletedInboundPaidAmount(invoiceId)
  return Math.max(0, Math.round((Number(total) - amountPaid) * 100) / 100)
}

export async function getInvoicePaymentOptionsByClientId(
  clientId: string
): Promise<InvoicePaymentOption[]> {
  if (!isSupabaseConfigured()) return []

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("invoices")
    .select("id, invoice_number, title, total, status, document_type")
    .eq("client_id", clientId)
    .eq("document_type", "invoice")
    .neq("status", "cancelled")
    .order("issue_date", { ascending: false })

  if (error) {
    console.error("Failed to load client invoices for payments", error)
    return []
  }

  const rows = data ?? []
  if (rows.length === 0) return []

  const invoiceIds = rows.map((row) => row.id)
  const { data: payments, error: paymentsError } = await supabase
    .from("crm_payments")
    .select("invoice_id, amount")
    .in("invoice_id", invoiceIds)
    .eq("status", "completed")
    .eq("direction", "inbound")

  if (paymentsError) {
    console.error("Failed to load invoice payment totals", paymentsError)
  }

  const paidByInvoice = new Map<string, number>()
  for (const payment of payments ?? []) {
    if (!payment.invoice_id) continue
    paidByInvoice.set(
      payment.invoice_id,
      (paidByInvoice.get(payment.invoice_id) ?? 0) + Number(payment.amount)
    )
  }

  return rows
    .map((row) => {
      const total = Number(row.total)
      const amountPaid = paidByInvoice.get(row.id) ?? 0
      const balance = Math.max(0, Math.round((total - amountPaid) * 100) / 100)

      return {
        id: row.id,
        invoiceNumber: row.invoice_number,
        title: row.title,
        total,
        status: asInvoiceStatus(row.status),
        amountPaid,
        balance,
      }
    })
    .filter((row) => row.balance > 0 || row.status !== "paid")
}
