import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { isDealStage } from "@/lib/crm/deal-types"
import { deleteDeal, updateDeal } from "@/lib/crm/deals"
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
    const patch: Parameters<typeof updateDeal>[1] = {}

    if (body.title !== undefined) {
      const title = sanitize(body.title)
      if (!title) {
        return NextResponse.json(
          { error: "Deal title is required." },
          { status: 400 }
        )
      }
      patch.title = title
    }

    if (body.value !== undefined) {
      const amount = parseAmountInput(
        typeof body.value === "number"
          ? String(body.value)
          : sanitize(body.value)
      )
      if (amount === null || amount < 0) {
        return NextResponse.json(
          { error: "Enter a valid deal value." },
          { status: 400 }
        )
      }
      patch.value = amount
    }

    if (body.stage !== undefined) {
      const stage = sanitize(body.stage)
      if (!isDealStage(stage)) {
        return NextResponse.json(
          { error: "Invalid deal stage." },
          { status: 400 }
        )
      }
      patch.stage = stage
    }

    if (body.probability !== undefined) {
      if (body.probability === null || body.probability === "") {
        patch.probability = null
      } else {
        const probabilityRaw =
          typeof body.probability === "number"
            ? body.probability
            : Number(sanitize(body.probability))
        if (!Number.isFinite(probabilityRaw) || probabilityRaw < 0) {
          return NextResponse.json(
            { error: "Enter a valid probability." },
            { status: 400 }
          )
        }
        patch.probability = Math.min(100, Math.round(probabilityRaw))
      }
    }

    if (body.expectedCloseDate !== undefined) {
      patch.expectedCloseDate = sanitize(body.expectedCloseDate) || null
    }

    if (body.notes !== undefined) {
      patch.notes = sanitize(body.notes)
    }

    const deal = await updateDeal(id, patch)
    return NextResponse.json({ success: true, deal })
  } catch (error) {
    console.error("Failed to update deal", error)
    return NextResponse.json(
      { error: "Unable to update deal." },
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
    await deleteDeal(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete deal", error)
    return NextResponse.json(
      { error: "Unable to delete deal." },
      { status: 500 }
    )
  }
}
