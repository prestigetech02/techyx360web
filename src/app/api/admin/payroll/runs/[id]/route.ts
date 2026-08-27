import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import {
  deletePayrollRun,
  getPayrollRunById,
  markPayrollRunPaid,
  setPayrollRunStatus,
} from "@/lib/payroll/runs"
import { isPayrollRunStatus } from "@/lib/payroll/payroll-types"
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
    const run = await getPayrollRunById(id)
    if (!run) {
      return NextResponse.json({ error: "Payroll run not found." }, { status: 404 })
    }
    return NextResponse.json({ run })
  } catch (error) {
    console.error("Failed to load payroll run", error)
    return NextResponse.json(
      { error: "Unable to load payroll run." },
      { status: 500 }
    )
  }
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
    const body = (await request.json()) as {
      action?: string
      paidAt?: string
      paymentReference?: string
      status?: string
    }

    const action = body.action?.trim()

    if (action === "approve") {
      const run = await setPayrollRunStatus(id, "approved")
      return NextResponse.json({ success: true, run })
    }

    if (action === "revert_draft") {
      const run = await setPayrollRunStatus(id, "draft")
      return NextResponse.json({ success: true, run })
    }

    if (action === "mark_paid") {
      if (!body.paidAt) {
        return NextResponse.json(
          { error: "Paid date is required." },
          { status: 400 }
        )
      }
      const run = await markPayrollRunPaid(id, {
        paidAt: body.paidAt,
        paymentReference: body.paymentReference,
      })
      return NextResponse.json({ success: true, run })
    }

    if (body.status && isPayrollRunStatus(body.status)) {
      const run = await setPayrollRunStatus(id, body.status)
      return NextResponse.json({ success: true, run })
    }

    return NextResponse.json({ error: "Unsupported action." }, { status: 400 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update payroll run."
    console.error("Failed to update payroll run", error)
    const status =
      message.includes("Only") || message.includes("Cannot") || message.includes("already")
        ? 400
        : 500
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
    await deletePayrollRun(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete payroll run."
    console.error("Failed to delete payroll run", error)
    const status = message.includes("cannot be deleted") ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
