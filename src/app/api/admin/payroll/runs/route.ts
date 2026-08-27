import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import {
  createPayrollRun,
  getAllPayrollRuns,
} from "@/lib/payroll/runs"
import { isSupabaseConfigured } from "@/lib/supabase/env"

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    )
  }

  const auth = await requireAdmin()
  if (!auth.authorized) return auth.response

  try {
    const runs = await getAllPayrollRuns()
    return NextResponse.json({ runs })
  } catch (error) {
    console.error("Failed to load payroll runs", error)
    return NextResponse.json(
      { error: "Unable to load payroll runs." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    )
  }

  const auth = await requireAdmin()
  if (!auth.authorized) return auth.response

  try {
    const body = (await request.json()) as {
      year?: number
      month?: number
      notes?: string
    }

    const year = Number(body.year)
    const month = Number(body.month)

    if (!Number.isInteger(year) || !Number.isInteger(month)) {
      return NextResponse.json(
        { error: "Year and month are required." },
        { status: 400 }
      )
    }

    const run = await createPayrollRun({
      year,
      month,
      notes: body.notes,
    })

    return NextResponse.json({ success: true, run }, { status: 201 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create payroll run."
    console.error("Failed to create payroll run", error)
    const status =
      message.includes("already exists") || message.includes("eligible")
        ? 400
        : 500
    return NextResponse.json({ error: message }, { status })
  }
}
