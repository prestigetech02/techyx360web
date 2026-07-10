import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { calculateInvoiceTotals } from "@/lib/invoices/calculations"
import { DEFAULT_VAT_RATE } from "@/config/invoice-defaults"
import { asDocumentType, asInvoiceStatus } from "@/lib/invoices/mappers"
import { parseLineItems } from "@/lib/invoices/parse"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function parseVatEnabled(value: unknown) {
  return value === true || value === "true"
}

function invoiceSchemaErrorMessage(error: { code?: string; message?: string }) {
  if (
    error.code === "PGRST204" &&
    error.message?.includes("vat_")
  ) {
    return "Invoice database is missing VAT columns. Run supabase/invoices-vat-migration.sql in the Supabase SQL editor, then try again."
  }

  return "Unable to update invoice right now."
}

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    )
  }

  const auth = await requireAdmin()
  if (!auth.authorized) {
    return auth.response
  }

  const { id } = await context.params

  try {
    const body = (await request.json()) as Record<string, unknown>
    const supabase = createAdminClient()

    const { data: existing } = await supabase
      .from("invoices")
      .select("id")
      .eq("id", id)
      .maybeSingle()

    if (!existing) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 })
    }

    // Status-only updates (e.g. mark as paid) skip full validation.
    if (
      Object.keys(body).length === 1 &&
      typeof body.status === "string"
    ) {
      const { error } = await supabase
        .from("invoices")
        .update({
          status: asInvoiceStatus(sanitize(body.status)),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) {
        console.error("Failed to update invoice status", error)
        return NextResponse.json(
          { error: "Unable to update invoice status." },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true })
    }

    const title = sanitize(body.title)
    const clientName = sanitize(body.clientName)
    const clientAddress = sanitize(body.clientAddress)
    const clientEmail = sanitize(body.clientEmail)
    const issueDate = sanitize(body.issueDate)
    const dueDate = sanitize(body.dueDate)
    const documentType = asDocumentType(sanitize(body.documentType))
    const status = asInvoiceStatus(sanitize(body.status))
    const notes = sanitize(body.notes)
    const signatureName = sanitize(body.signatureName)
    const signatureTitle = sanitize(body.signatureTitle)
    const invoiceNumber = sanitize(body.invoiceNumber)
    const lineItems = parseLineItems(body.lineItems)
    const vatEnabled = parseVatEnabled(body.vatEnabled)

    const payment =
      typeof body.payment === "object" && body.payment !== null
        ? (body.payment as Record<string, unknown>)
        : {}
    const paymentBankName = sanitize(payment.bankName)
    const paymentAccountNumber = sanitize(payment.accountNumber)
    const paymentAccountName = sanitize(payment.accountName)

    if (!title || !clientName || !issueDate || !invoiceNumber) {
      return NextResponse.json(
        {
          error:
            "Invoice number, title, client name, and issue date are required.",
        },
        { status: 400 }
      )
    }

    if (lineItems.length === 0) {
      return NextResponse.json(
        { error: "At least one line item is required." },
        { status: 400 }
      )
    }

    if (!paymentBankName || !paymentAccountNumber || !paymentAccountName) {
      return NextResponse.json(
        { error: "Payment method details are required." },
        { status: 400 }
      )
    }

    const { data: duplicate } = await supabase
      .from("invoices")
      .select("id")
      .eq("invoice_number", invoiceNumber)
      .neq("id", id)
      .maybeSingle()

    if (duplicate) {
      return NextResponse.json(
        { error: "Another invoice already uses this number." },
        { status: 409 }
      )
    }

    const totals = calculateInvoiceTotals(lineItems, {
      vatEnabled,
      vatRate: DEFAULT_VAT_RATE,
    })

    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        invoice_number: invoiceNumber,
        document_type: documentType,
        status,
        title,
        issue_date: issueDate,
        due_date: dueDate || null,
        client_name: clientName,
        client_address: clientAddress || null,
        client_email: clientEmail || null,
        payment_bank_name: paymentBankName,
        payment_account_number: paymentAccountNumber,
        payment_account_name: paymentAccountName,
        signature_name: signatureName || null,
        signature_title: signatureTitle || null,
        notes: notes || null,
        subtotal: totals.subtotal,
        discount_total: totals.discountTotal,
        vat_enabled: totals.vatEnabled,
        vat_rate: totals.vatRate,
        vat_amount: totals.vatAmount,
        total: totals.total,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (updateError) {
      console.error("Failed to update invoice", updateError)
      return NextResponse.json(
        { error: invoiceSchemaErrorMessage(updateError) },
        { status: 500 }
      )
    }

    const { error: deleteItemsError } = await supabase
      .from("invoice_line_items")
      .delete()
      .eq("invoice_id", id)

    if (deleteItemsError) {
      console.error("Failed to replace invoice line items", deleteItemsError)
      return NextResponse.json(
        { error: "Unable to update invoice line items." },
        { status: 500 }
      )
    }

    const { error: insertItemsError } = await supabase
      .from("invoice_line_items")
      .insert(
        lineItems.map((item, index) => ({
          invoice_id: id,
          description: item.description,
          amount: item.amount,
          item_type: item.type,
          sort_order: index,
        }))
      )

    if (insertItemsError) {
      console.error("Failed to insert invoice line items", insertItemsError)
      return NextResponse.json(
        { error: "Unable to update invoice line items." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected invoice update error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    )
  }

  const auth = await requireAdmin()
  if (!auth.authorized) {
    return auth.response
  }

  const { id } = await context.params

  const supabase = createAdminClient()
  const { error } = await supabase.from("invoices").delete().eq("id", id)

  if (error) {
    console.error("Failed to delete invoice", error)
    return NextResponse.json(
      { error: "Unable to delete invoice right now." },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
