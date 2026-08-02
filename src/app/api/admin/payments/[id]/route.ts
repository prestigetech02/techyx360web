import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import {
  isPaymentDirection,
  isPaymentMethod,
  isPaymentPurpose,
  isPaymentStatus,
} from "@/lib/crm/payment-types"
import { deletePayment, updatePayment } from "@/lib/crm/payments"
import { parseAmountInput } from "@/lib/money"
import { isSupabaseConfigured } from "@/lib/supabase/env"

type RouteContext = {
  params: Promise<{ id: string }>
}

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function PATCH(request: Request, context: RouteContext) {
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
    const patch: Parameters<typeof updatePayment>[1] = {}

    if (body.clientId !== undefined) {
      patch.clientId = sanitize(body.clientId) || null
    }
    if (body.invoiceId !== undefined) {
      patch.invoiceId = sanitize(body.invoiceId) || null
    }
    if (body.dealId !== undefined) {
      patch.dealId = sanitize(body.dealId) || null
    }
    if (body.amount !== undefined) {
      const amount = parseAmountInput(
        typeof body.amount === "number"
          ? String(body.amount)
          : sanitize(body.amount)
      )
      if (amount === null || amount <= 0) {
        return NextResponse.json(
          { error: "Enter a valid payment amount." },
          { status: 400 }
        )
      }
      patch.amount = amount
    }
    if (body.method !== undefined) {
      const method = sanitize(body.method)
      if (!isPaymentMethod(method)) {
        return NextResponse.json(
          { error: "Invalid payment method." },
          { status: 400 }
        )
      }
      patch.method = method
    }
    if (body.status !== undefined) {
      const status = sanitize(body.status)
      if (!isPaymentStatus(status)) {
        return NextResponse.json(
          { error: "Invalid payment status." },
          { status: 400 }
        )
      }
      patch.status = status
    }
    if (body.direction !== undefined) {
      const direction = sanitize(body.direction)
      if (!isPaymentDirection(direction)) {
        return NextResponse.json(
          { error: "Invalid payment direction." },
          { status: 400 }
        )
      }
      patch.direction = direction
    }
    if (body.purpose !== undefined) {
      const purpose = sanitize(body.purpose)
      if (!isPaymentPurpose(purpose)) {
        return NextResponse.json(
          { error: "Invalid payment purpose." },
          { status: 400 }
        )
      }
      patch.purpose = purpose
    }
    if (body.paidAt !== undefined) {
      const paidAt = sanitize(body.paidAt)
      if (!paidAt) {
        return NextResponse.json(
          { error: "Payment date is required." },
          { status: 400 }
        )
      }
      patch.paidAt = paidAt
    }
    if (body.reference !== undefined) patch.reference = sanitize(body.reference)
    if (body.description !== undefined) {
      patch.description = sanitize(body.description)
    }
    if (body.notes !== undefined) patch.notes = sanitize(body.notes)

    const payment = await updatePayment(id, patch)
    return NextResponse.json({ success: true, payment })
  } catch (error) {
    console.error("Failed to update payment", error)
    return NextResponse.json(
      { error: "Unable to update payment." },
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
  if (!auth.authorized) return auth.response

  const { id } = await context.params

  try {
    await deletePayment(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete payment", error)
    return NextResponse.json(
      { error: "Unable to delete payment." },
      { status: 500 }
    )
  }
}
