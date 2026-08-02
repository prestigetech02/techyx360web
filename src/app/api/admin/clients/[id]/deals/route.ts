import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { getClientById } from "@/lib/crm/clients"
import { createDeal, getDealsByClientId } from "@/lib/crm/deals"
import { isDealStage } from "@/lib/crm/deal-types"
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

    const deals = await getDealsByClientId(id)
    return NextResponse.json({ deals })
  } catch (error) {
    console.error("Failed to load client deals", error)
    return NextResponse.json(
      { error: "Unable to load deals." },
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

    if (!title) {
      return NextResponse.json(
        { error: "Deal title is required." },
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

    const probability =
      Number.isFinite(probabilityRaw) && probabilityRaw >= 0
        ? Math.min(100, Math.round(probabilityRaw))
        : null

    const deal = await createDeal({
      clientId: id,
      title,
      value: amount,
      stage: stageValue,
      probability,
      expectedCloseDate,
      notes,
    })

    return NextResponse.json({ success: true, deal })
  } catch (error) {
    console.error("Failed to create client deal", error)
    return NextResponse.json(
      { error: "Unable to save deal right now." },
      { status: 500 }
    )
  }
}
