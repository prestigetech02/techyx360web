import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { getLeadById, insertLeadActivity } from "@/lib/crm/leads"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

type RouteContext = {
  params: Promise<{ id: string }>
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
    const content =
      typeof body.content === "string" ? body.content.trim() : ""
    const authorName =
      typeof body.author_name === "string" && body.author_name.trim()
        ? body.author_name.trim()
        : typeof body.authorName === "string" && body.authorName.trim()
          ? body.authorName.trim()
          : existing.assignedTo !== "Unassigned"
            ? existing.assignedTo
            : "Admin"

    if (!content) {
      return NextResponse.json(
        { error: "Note content is required." },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from("crm_lead_notes").insert({
      lead_id: id,
      content,
      author_name: authorName,
    })

    if (error) {
      console.error("Failed to create CRM lead note", error)
      return NextResponse.json(
        { error: "Unable to add note right now." },
        { status: 500 }
      )
    }

    await insertLeadActivity({
      leadId: id,
      type: "note",
      title: "Note added",
      authorName,
    })

    const lead = await getLeadById(id)
    return NextResponse.json({ success: true, lead }, { status: 201 })
  } catch (error) {
    console.error("Unexpected CRM lead note error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}
