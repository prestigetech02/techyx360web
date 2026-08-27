import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { isPaymentMethod } from "@/lib/crm/payment-types"
import { recordCourseRegistrationPayment } from "@/lib/crm/record-training-payment"
import { parseAmountInput } from "@/lib/money"
import { isSupabaseConfigured } from "@/lib/supabase/env"

type RouteContext = {
  params: Promise<{ id: string }>
}

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
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
    const body = (await request.json()) as Record<string, unknown>
    const paidAt = sanitize(body.paidAt)
    const reference = sanitize(body.reference)
    const notes = sanitize(body.notes)
    const methodValue = sanitize(body.method) || "bank_transfer"
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

    const payment = await recordCourseRegistrationPayment(id, {
      amount,
      paidAt,
      method: methodValue,
      reference,
      notes,
    })

    return NextResponse.json({ success: true, payment })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to record payment."
    console.error("Failed to record course registration payment", error)
    const status =
      message.includes("not found") || message.includes("already recorded")
        ? 400
        : message.includes("crm-payments-registration-links.sql")
          ? 500
          : 500
    return NextResponse.json({ error: message }, { status })
  }
}
