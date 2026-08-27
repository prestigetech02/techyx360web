import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import {
  deletePayrollItem,
  getPayrollItemById,
  updatePayrollItem,
} from "@/lib/payroll/runs"
import { isSupabaseConfigured } from "@/lib/supabase/env"

type RouteContext = {
  params: Promise<{ id: string }>
}

function parseAmount(value: unknown) {
  if (typeof value === "number") return value
  if (typeof value === "string" && value.trim()) return Number(value)
  return undefined
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
    const item = await updatePayrollItem(id, {
      grossAmount: parseAmount(body.grossAmount ?? body.gross_amount),
      bonusAmount: parseAmount(body.bonusAmount ?? body.bonus_amount),
      deductionAmount: parseAmount(
        body.deductionAmount ?? body.deduction_amount
      ),
      deductionNote:
        typeof body.deductionNote === "string"
          ? body.deductionNote
          : typeof body.deduction_note === "string"
            ? body.deduction_note
            : undefined,
      notes: typeof body.notes === "string" ? body.notes : undefined,
    })

    return NextResponse.json({ success: true, item })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update payroll item."
    console.error("Failed to update payroll item", error)
    const status = message.includes("Only draft") ? 400 : 500
    return NextResponse.json({ error: message }, { status })
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
    await deletePayrollItem(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete payroll item."
    console.error("Failed to delete payroll item", error)
    const status = message.includes("Only draft") ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
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
    const result = await getPayrollItemById(id)
    if (!result) {
      return NextResponse.json({ error: "Payroll item not found." }, { status: 404 })
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to load payroll item", error)
    return NextResponse.json(
      { error: "Unable to load payroll item." },
      { status: 500 }
    )
  }
}
