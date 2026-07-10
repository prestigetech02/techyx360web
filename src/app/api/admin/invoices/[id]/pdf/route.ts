import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { generateInvoicePdf } from "@/lib/invoices/generate-invoice-pdf"
import { getInvoiceById } from "@/lib/invoices/queries"
import { isSupabaseConfigured } from "@/lib/supabase/env"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
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
  const invoice = await getInvoiceById(id)

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 })
  }

  try {
    const pdf = await generateInvoicePdf(invoice)

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoice_number}.pdf"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Failed to generate invoice PDF", error)
    return NextResponse.json(
      { error: "Unable to generate invoice PDF right now." },
      { status: 500 }
    )
  }
}
