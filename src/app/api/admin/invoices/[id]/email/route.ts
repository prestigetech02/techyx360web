import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { getInvoiceById } from "@/lib/invoices/queries"
import { isInvoiceEmailConfigured } from "@/lib/invoices/email-config"
import { sendInvoiceEmail } from "@/lib/invoices/send-invoice-email"
import { isSupabaseConfigured } from "@/lib/supabase/env"

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, context: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    )
  }

  if (!isInvoiceEmailConfigured()) {
    return NextResponse.json(
      {
        error:
          "Email is not configured. Add RESEND_API_KEY and INVOICE_FROM_EMAIL to your environment variables.",
      },
      { status: 500 }
    )
  }

  const auth = await requireAdmin()
  if (!auth.authorized) {
    return auth.response
  }

  const { id } = await context.params
  const invoice = await getInvoiceById(id)

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 })
  }

  try {
    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >
    const to = sanitize(body.to) || invoice.client_email || ""
    const message = sanitize(body.message)

    if (!to || !to.includes("@")) {
      return NextResponse.json(
        { error: "A valid recipient email address is required." },
        { status: 400 }
      )
    }

    await sendInvoiceEmail({ invoice, to, message })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to email invoice", error)
    const message =
      error instanceof Error
        ? error.message
        : "Unable to send invoice email right now."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
