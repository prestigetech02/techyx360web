import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { getAllClients, getClientById } from "@/lib/crm/clients"
import { parseCreateClientBody } from "@/lib/crm/parse-client-body"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

export async function GET() {
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

  try {
    const clients = await getAllClients()
    return NextResponse.json({ clients })
  } catch (error) {
    console.error("Unexpected CRM clients list error", error)
    return NextResponse.json(
      { error: "Unable to load clients." },
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
  if (!auth.authorized) {
    return auth.response
  }

  try {
    const body = (await request.json()) as Record<string, unknown>
    const parsed = parseCreateClientBody(body)

    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.error },
        { status: parsed.status }
      )
    }

    const supabase = createAdminClient()
    const { note, ...clientFields } = parsed.data
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from("crm_clients")
      .insert({
        ...clientFields,
        last_activity_at: now,
        updated_at: now,
      })
      .select("id")
      .single()

    if (error || !data) {
      console.error("Failed to create CRM client", error)
      return NextResponse.json(
        { error: "Unable to create client right now." },
        { status: 500 }
      )
    }

    if (note) {
      const { error: noteError } = await supabase
        .from("crm_client_notes")
        .insert({
          client_id: data.id,
          content: note,
          author_name: "Admin",
        })

      if (noteError) {
        console.error("Failed to create initial CRM client note", noteError)
      }
    }

    const client = await getClientById(data.id)
    return NextResponse.json({ success: true, client }, { status: 201 })
  } catch (error) {
    console.error("Unexpected CRM client create error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}
