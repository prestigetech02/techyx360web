import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { getClientById } from "@/lib/crm/clients"
import { isDealStage } from "@/lib/crm/deal-types"
import { createDeal, getAllDeals } from "@/lib/crm/deals"
import { parseAmountInput } from "@/lib/money"
import { isSupabaseConfigured } from "@/lib/supabase/env"

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

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
    const deals = await getAllDeals()
    return NextResponse.json({ deals })
  } catch (error) {
    console.error("Failed to load deals", error)
    return NextResponse.json(
      { error: "Unable to load deals." },
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
    const body = (await request.json()) as Record<string, unknown>
    const clientId = sanitize(body.clientId)
    const title = sanitize(body.title)
    const stageValue = sanitize(body.stage) || "qualified"
    const expectedCloseDate = sanitize(body.expectedCloseDate) || null
    const notes = sanitize(body.notes)
    const amount = parseAmountInput(
      typeof body.value === "number" ? String(body.value) : sanitize(body.value)
    )
    const probabilityRaw =
      typeof body.probability === "number"
        ? body.probability
        : Number(sanitize(body.probability))

    if (!clientId || !title) {
      return NextResponse.json(
        { error: "Client and deal title are required." },
        { status: 400 }
      )
    }

    if (!isDealStage(stageValue)) {
      return NextResponse.json({ error: "Invalid deal stage." }, { status: 400 })
    }

    if (amount === null || amount < 0) {
      return NextResponse.json(
        { error: "Enter a valid deal value." },
        { status: 400 }
      )
    }

    const client = await getClientById(clientId)
    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 })
    }

    const probability =
      Number.isFinite(probabilityRaw) && probabilityRaw >= 0
        ? Math.min(100, Math.round(probabilityRaw))
        : null

    const deal = await createDeal({
      clientId,
      title,
      value: amount,
      stage: stageValue,
      probability,
      expectedCloseDate,
      notes,
    })

    return NextResponse.json({ success: true, deal })
  } catch (error) {
    console.error("Failed to create deal", error)
    return NextResponse.json(
      { error: "Unable to save deal right now." },
      { status: 500 }
    )
  }
}
