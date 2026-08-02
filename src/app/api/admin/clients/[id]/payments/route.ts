import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { getClientById } from "@/lib/crm/clients"
import {
  isPaymentDirection,
  isPaymentMethod,
  isPaymentPurpose,
  isPaymentStatus,
} from "@/lib/crm/payment-types"
import { createPayment, getPaymentsByClientId } from "@/lib/crm/payments"
import { parseAmountInput } from "@/lib/money"
import { isSupabaseConfigured } from "@/lib/supabase/env"

type RouteContext = {
  params: Promise<{ id: string }>
}

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
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

    const payments = await getPaymentsByClientId(id)
    return NextResponse.json({ payments })
  } catch (error) {
    console.error("Failed to load client payments", error)
    return NextResponse.json(
      { error: "Unable to load payments." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request, context: RouteContext) {
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

    const body = (await request.json()) as Record<string, unknown>
    const invoiceId = sanitize(body.invoiceId) || null
    const dealId = sanitize(body.dealId) || null
    const methodValue = sanitize(body.method) || "bank_transfer"
    const statusValue = sanitize(body.status) || "completed"
    const directionValue = sanitize(body.direction) || "inbound"
    const purposeValue = sanitize(body.purpose)
    const paidAt = sanitize(body.paidAt)
    const reference = sanitize(body.reference)
    const description = sanitize(body.description)
    const notes = sanitize(body.notes)
    const amount = parseAmountInput(
      typeof body.amount === "number"
        ? String(body.amount)
        : sanitize(body.amount)
    )

    if (!paidAt) {
      return NextResponse.json(
        { error: "Payment date is required." },
        { status: 400 }
      )
    }

    if (amount === null || amount <= 0) {
      return NextResponse.json(
        { error: "Enter a valid payment amount." },
        { status: 400 }
      )
    }

    if (!isPaymentMethod(methodValue)) {
      return NextResponse.json(
        { error: "Invalid payment method." },
        { status: 400 }
      )
    }

    if (!isPaymentStatus(statusValue)) {
      return NextResponse.json(
        { error: "Invalid payment status." },
        { status: 400 }
      )
    }

    if (!isPaymentDirection(directionValue)) {
      return NextResponse.json(
        { error: "Invalid payment direction." },
        { status: 400 }
      )
    }

    if (!isPaymentPurpose(purposeValue)) {
      return NextResponse.json(
        { error: "Payment purpose is required." },
        { status: 400 }
      )
    }

    const payment = await createPayment({
      clientId: id,
      invoiceId,
      dealId,
      amount,
      method: methodValue,
      status: statusValue,
      direction: directionValue,
      purpose: purposeValue,
      paidAt,
      reference,
      description,
      notes,
    })

    return NextResponse.json({ success: true, payment })
  } catch (error) {
    console.error("Failed to create client payment", error)
    return NextResponse.json(
      { error: "Unable to save payment right now." },
      { status: 500 }
    )
  }
}
