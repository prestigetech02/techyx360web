import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { getClientById } from "@/lib/crm/clients"
import { getInvoicePaymentOptionsByClientId } from "@/lib/invoices/payment-link"
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
  if (!auth.authorized) return auth.response

  const { id } = await context.params

  try {
    const client = await getClientById(id)
    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 })
    }

    const invoices = await getInvoicePaymentOptionsByClientId(id)
    return NextResponse.json({ invoices })
  } catch (error) {
    console.error("Failed to load client invoices", error)
    return NextResponse.json(
      { error: "Unable to load invoices." },
      { status: 500 }
    )
  }
}
