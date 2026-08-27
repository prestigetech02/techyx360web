import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import {
  getFinanceReconciliation,
  isReconciliationStatus,
  saveFinanceReconciliation,
} from "@/lib/admin/finance-reconciliation"
import { isSupabaseConfigured } from "@/lib/supabase/env"

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    )
  }

  const auth = await requireAdmin()
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const reconciliation = await getFinanceReconciliation({
      year: searchParams.get("year") ?? undefined,
      month: searchParams.get("month") ?? undefined,
    })
    return NextResponse.json({ reconciliation })
  } catch (error) {
    console.error("Failed to load reconciliation", error)
    return NextResponse.json(
      {
        error:
          "Unable to load reconciliation. Run supabase/finance-reconciliations.sql in Supabase.",
      },
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
      openingBalance?: number
      closingBalance?: number
      notes?: string
      status?: string
    }

    const year = Number(body.year)
    const month = Number(body.month)
    const openingBalance = Number(body.openingBalance)
    const closingBalance = Number(body.closingBalance)

    if (!Number.isInteger(year) || !Number.isInteger(month)) {
      return NextResponse.json(
        { error: "Year and month are required." },
        { status: 400 }
      )
    }

    if (!Number.isFinite(openingBalance) || !Number.isFinite(closingBalance)) {
      return NextResponse.json(
        { error: "Opening and closing balances are required." },
        { status: 400 }
      )
    }

    const status =
      typeof body.status === "string" && isReconciliationStatus(body.status)
        ? body.status
        : "open"

    const reconciliation = await saveFinanceReconciliation({
      year,
      month,
      openingBalance,
      closingBalance,
      notes: body.notes,
      status,
    })

    return NextResponse.json({ success: true, reconciliation })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save reconciliation."
    console.error("Failed to save reconciliation", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
