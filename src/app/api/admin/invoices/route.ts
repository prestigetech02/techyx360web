import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { calculateInvoiceTotals } from "@/lib/invoices/calculations"
import { DEFAULT_VAT_RATE } from "@/config/invoice-defaults"
import { asDocumentType, asInvoiceStatus } from "@/lib/invoices/mappers"
import { generateInvoiceNumber } from "@/lib/invoices/numbering"
import { parseLineItems } from "@/lib/invoices/parse"
import { getInvoiceCountForYear } from "@/lib/invoices/queries"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function invoiceSchemaErrorMessage(error: { code?: string; message?: string }) {
  if (
    error.code === "PGRST204" &&
    error.message?.includes("vat_")
  ) {
    return "Invoice database is missing VAT columns. Run supabase/invoices-vat-migration.sql in the Supabase SQL editor, then try again."
  }

  return "Unable to create invoice right now."
}

function parseVatEnabled(value: unknown) {
  return value === true || value === "true"
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured yet." },
      { status: 500 }
    )
  }

  const auth = await requireAdmin()
  if (!auth.authorized) {
    return auth.response
  }

  try {
    const body = (await request.json()) as Record<string, unknown>

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
    const lineItems = parseLineItems(body.lineItems)
    const vatEnabled = parseVatEnabled(body.vatEnabled)

    const payment =
      typeof body.payment === "object" && body.payment !== null
        ? (body.payment as Record<string, unknown>)
        : {}
    const paymentBankName = sanitize(payment.bankName)
    const paymentAccountNumber = sanitize(payment.accountNumber)
    const paymentAccountName = sanitize(payment.accountName)

    if (!title || !clientName || !issueDate) {
      return NextResponse.json(
        { error: "Title, client name, and issue date are required." },
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

    const totals = calculateInvoiceTotals(lineItems, {
      vatEnabled,
      vatRate: DEFAULT_VAT_RATE,
    })

    const year = new Date(issueDate).getFullYear() || new Date().getFullYear()
    const existingCount = await getInvoiceCountForYear(year)

    const supabase = createAdminClient()

    let invoiceNumber = sanitize(body.invoiceNumber)
    if (!invoiceNumber) {
      invoiceNumber = generateInvoiceNumber({
        clientName,
        sequence: existingCount + 1,
        year,
      })
    }

    const { data: duplicate } = await supabase
      .from("invoices")
      .select("id")
      .eq("invoice_number", invoiceNumber)
      .maybeSingle()

    if (duplicate) {
      return NextResponse.json(
        { error: "An invoice with this number already exists." },
        { status: 409 }
      )
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
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
      })
      .select("id, invoice_number")
      .single()

    if (invoiceError || !invoice) {
      console.error("Failed to create invoice", invoiceError)
      return NextResponse.json(
        {
          error: invoiceError
            ? invoiceSchemaErrorMessage(invoiceError)
            : "Unable to create invoice right now.",
        },
        { status: 500 }
      )
    }

    const { error: itemsError } = await supabase
      .from("invoice_line_items")
      .insert(
        lineItems.map((item, index) => ({
          invoice_id: invoice.id,
          description: item.description,
          amount: item.amount,
          item_type: item.type,
          sort_order: index,
        }))
      )

    if (itemsError) {
      console.error("Failed to create invoice line items", itemsError)
      await supabase.from("invoices").delete().eq("id", invoice.id)
      return NextResponse.json(
        { error: "Unable to save invoice line items." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, invoice })
  } catch (error) {
    console.error("Unexpected invoice create error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}
