import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import {
  getLeadById,
  insertLeadActivity,
  LEAD_ACTIVITY_TYPES,
  type LeadActivityType,
} from "@/lib/crm/leads"
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
  if (!auth.authorized) {
    return auth.response
  }

  const { id } = await context.params

  try {
    const lead = await getLeadById(id)
    if (!lead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 })
    }

    return NextResponse.json({ activities: lead.activities })
  } catch (error) {
    console.error("Unexpected CRM lead activities fetch error", error)
    return NextResponse.json(
      { error: "Unable to load activities." },
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
  if (!auth.authorized) {
    return auth.response
  }

  const { id } = await context.params

  try {
    const existing = await getLeadById(id)
    if (!existing) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const typeRaw =
      typeof body.type === "string" ? body.type.trim().toLowerCase() : ""
    const title = typeof body.title === "string" ? body.title.trim() : ""
    const authorName =
      typeof body.author_name === "string" && body.author_name.trim()
        ? body.author_name.trim()
        : typeof body.authorName === "string" && body.authorName.trim()
          ? body.authorName.trim()
          : "Admin"

    if (!LEAD_ACTIVITY_TYPES.has(typeRaw as LeadActivityType)) {
      return NextResponse.json(
        { error: "Invalid activity type." },
        { status: 400 }
      )
    }

    if (!title) {
      return NextResponse.json(
        { error: "Activity title is required." },
        { status: 400 }
      )
    }

    await insertLeadActivity({
      leadId: id,
      type: typeRaw as LeadActivityType,
      title,
      authorName,
    })

    const lead = await getLeadById(id)
    return NextResponse.json(
      { success: true, activities: lead?.activities ?? [], lead },
      { status: 201 }
    )
  } catch (error) {
    console.error("Unexpected CRM lead activity create error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}
