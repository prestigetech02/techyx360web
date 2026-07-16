import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { getLeadById, insertLeadActivity } from "@/lib/crm/leads"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(_request: Request, context: RouteContext) {
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

    if (existing.status === "converted" && existing.clientId) {
      return NextResponse.json(
        { error: "Lead is already converted.", lead: existing },
        { status: 409 }
      )
    }

    const supabase = createAdminClient()
    const now = new Date().toISOString()

    const { data: client, error: clientError } = await supabase
      .from("crm_clients")
      .insert({
        company: existing.company,
        contact_name: existing.name,
        email: existing.email,
        phone: existing.phone,
        industry: "General",
        product: "Custom software",
        role: "Contact",
        location: "Nigeria",
        company_size: "11 - 50 employees",
        status: "active",
        last_activity_at: now,
        updated_at: now,
      })
      .select("id, company, contact_name, email, phone, status")
      .single()

    if (clientError || !client) {
      console.error("Failed to create CRM client from lead", clientError)
      return NextResponse.json(
        { error: "Unable to convert lead right now." },
        { status: 500 }
      )
    }

    if (existing.notes.length > 0) {
      const { error: notesError } = await supabase
        .from("crm_client_notes")
        .insert(
          existing.notes.map((note) => ({
            client_id: client.id,
            content: note.content,
            author_name: note.author || "Admin",
            created_at: note.createdAt,
          }))
        )

      if (notesError) {
        console.error("Failed to copy lead notes to client", notesError)
      }
    }

    const { error: leadError } = await supabase
      .from("crm_leads")
      .update({
        status: "converted",
        client_id: client.id,
        updated_at: now,
      })
      .eq("id", id)

    if (leadError) {
      console.error("Failed to mark CRM lead as converted", leadError)
      return NextResponse.json(
        { error: "Client created but lead status could not be updated." },
        { status: 500 }
      )
    }

    await insertLeadActivity({
      leadId: id,
      type: "status",
      title: "Converted to client",
      authorName: "Admin",
    })

    const lead = await getLeadById(id)
    return NextResponse.json({ success: true, lead, client })
  } catch (error) {
    console.error("Unexpected CRM lead convert error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}
