import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { getClientById, touchClientActivity } from "@/lib/crm/clients"
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
    const existing = await getClientById(id)
    if (!existing) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const content =
      typeof body.content === "string" ? body.content.trim() : ""
    const authorName =
      typeof body.author_name === "string" && body.author_name.trim()
        ? body.author_name.trim()
        : typeof body.authorName === "string" && body.authorName.trim()
          ? body.authorName.trim()
          : "Admin"

    if (!content) {
      return NextResponse.json(
        { error: "Note content is required." },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from("crm_client_notes").insert({
      client_id: id,
      content,
      author_name: authorName,
    })

    if (error) {
      console.error("Failed to create CRM client note", error)
      return NextResponse.json(
        { error: "Unable to add note right now." },
        { status: 500 }
      )
    }

    await touchClientActivity(id)

    const client = await getClientById(id)
    return NextResponse.json({ success: true, client }, { status: 201 })
  } catch (error) {
    console.error("Unexpected CRM client note error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}
