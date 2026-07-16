import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import {
  getLeadById,
  insertLeadActivity,
  statusChangeTitle,
  type LeadStatus,
} from "@/lib/crm/leads"
import { parseUpdateLeadBody } from "@/lib/crm/parse-lead-body"
import { createAdminClient } from "@/lib/supabase/admin"
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
    return NextResponse.json({ lead })
  } catch (error) {
    console.error("Unexpected CRM lead fetch error", error)
    return NextResponse.json(
      { error: "Unable to load lead." },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, context: RouteContext) {
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
    const parsed = parseUpdateLeadBody(body)

    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.error },
        { status: parsed.status }
      )
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("crm_leads")
      .update({
        ...parsed.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, status")
      .single()

    if (error || !data) {
      console.error("Failed to update CRM lead", error)
      return NextResponse.json(
        { error: "Unable to update lead right now." },
        { status: 500 }
      )
    }

    if (
      parsed.data.status &&
      parsed.data.status !== existing.status
    ) {
      await insertLeadActivity({
        leadId: id,
        type: "status",
        title: statusChangeTitle(parsed.data.status as LeadStatus),
        authorName: "Admin",
      })
    }

    const lead = await getLeadById(id)
    return NextResponse.json({ success: true, lead })
  } catch (error) {
    console.error("Unexpected CRM lead update error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
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
  if (!auth.authorized) {
    return auth.response
  }

  const { id } = await context.params

  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from("crm_leads").delete().eq("id", id)

    if (error) {
      console.error("Failed to delete CRM lead", error)
      return NextResponse.json(
        { error: "Unable to delete lead." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected CRM lead delete error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}
