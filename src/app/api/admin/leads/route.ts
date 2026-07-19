import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import {
  getAllLeads,
  getLeadById,
  insertLeadActivity,
} from "@/lib/crm/leads"
import { parseCreateLeadBody } from "@/lib/crm/parse-lead-body"
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
    const leads = await getAllLeads()
    return NextResponse.json({ leads })
  } catch (error) {
    console.error("Unexpected CRM leads list error", error)
    return NextResponse.json(
      { error: "Unable to load leads." },
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
    const parsed = parseCreateLeadBody(body)

    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.error },
        { status: parsed.status }
      )
    }

    const supabase = createAdminClient()
    const { note, ...leadFields } = parsed.data

    const { data, error } = await supabase
      .from("crm_leads")
      .insert(leadFields)
      .select(
        "id, full_name, email, phone, company, address, source, status, assigned_to, score, client_id, created_at, updated_at"
      )
      .single()

    if (error || !data) {
      console.error("Failed to create CRM lead", error)
      return NextResponse.json(
        { error: "Unable to create lead right now." },
        { status: 500 }
      )
    }

    await insertLeadActivity({
      leadId: data.id,
      type: "system",
      title: `Lead created from ${data.source}`,
      authorName: "System",
    })

    if (note) {
      const authorName = data.assigned_to?.trim() || "Admin"
      const { error: noteError } = await supabase.from("crm_lead_notes").insert({
        lead_id: data.id,
        content: note,
        author_name: authorName,
      })

      if (noteError) {
        console.error("Failed to create initial CRM lead note", noteError)
      } else {
        await insertLeadActivity({
          leadId: data.id,
          type: "note",
          title: "Note added",
          authorName,
        })
      }
    }

    const lead = await getLeadById(data.id)
    return NextResponse.json({ success: true, lead }, { status: 201 })
  } catch (error) {
    console.error("Unexpected CRM lead create error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}
