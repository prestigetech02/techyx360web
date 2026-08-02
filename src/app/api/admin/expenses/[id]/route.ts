import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import {
  isExpenseCategory,
  isExpenseMethod,
  isExpenseStatus,
} from "@/lib/crm/expense-types"
import { deleteExpense, updateExpense } from "@/lib/crm/expenses"
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
    const patch: Parameters<typeof updateExpense>[1] = {}

    if (body.clientId !== undefined) {
      patch.clientId = sanitize(body.clientId) || null
    }
    if (body.projectId !== undefined) {
      patch.projectId = sanitize(body.projectId) || null
    }
    if (body.amount !== undefined) {
      const amount = parseAmountInput(
        typeof body.amount === "number"
          ? String(body.amount)
          : sanitize(body.amount)
      )
      if (amount === null || amount <= 0) {
        return NextResponse.json(
          { error: "Enter a valid expense amount." },
          { status: 400 }
        )
      }
      patch.amount = amount
    }
    if (body.category !== undefined) {
      const category = sanitize(body.category)
      if (!isExpenseCategory(category)) {
        return NextResponse.json(
          { error: "Invalid expense category." },
          { status: 400 }
        )
      }
      patch.category = category
    }
    if (body.vendor !== undefined) patch.vendor = sanitize(body.vendor)
    if (body.method !== undefined) {
      const method = sanitize(body.method)
      if (!isExpenseMethod(method)) {
        return NextResponse.json(
          { error: "Invalid payment method." },
          { status: 400 }
        )
      }
      patch.method = method
    }
    if (body.status !== undefined) {
      const status = sanitize(body.status)
      if (!isExpenseStatus(status)) {
        return NextResponse.json(
          { error: "Invalid expense status." },
          { status: 400 }
        )
      }
      patch.status = status
    }
    if (body.spentAt !== undefined) {
      const spentAt = sanitize(body.spentAt)
      if (!spentAt) {
        return NextResponse.json(
          { error: "Expense date is required." },
          { status: 400 }
        )
      }
      patch.spentAt = spentAt
    }
    if (body.reference !== undefined) patch.reference = sanitize(body.reference)
    if (body.description !== undefined) {
      patch.description = sanitize(body.description)
    }
    if (body.notes !== undefined) patch.notes = sanitize(body.notes)
    if (body.receiptUrl !== undefined) {
      patch.receiptUrl = sanitize(body.receiptUrl)
    }

    const expense = await updateExpense(id, patch)
    return NextResponse.json({ success: true, expense })
  } catch (error) {
    console.error("Failed to update expense", error)
    return NextResponse.json(
      { error: "Unable to update expense." },
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
    await deleteExpense(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete expense", error)
    return NextResponse.json(
      { error: "Unable to delete expense." },
      { status: 500 }
    )
  }
}
