import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { getClientById } from "@/lib/crm/clients"
import { parseUpdateClientBody } from "@/lib/crm/parse-client-body"
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
    const client = await getClientById(id)
    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 })
    }
    return NextResponse.json({ client })
  } catch (error) {
    console.error("Unexpected CRM client fetch error", error)
    return NextResponse.json(
      { error: "Unable to load client." },
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
    const existing = await getClientById(id)
    if (!existing) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const parsed = parseUpdateClientBody(body)

    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.error },
        { status: parsed.status }
      )
    }

    const now = new Date().toISOString()
    const supabase = createAdminClient()
    const { error } = await supabase
      .from("crm_clients")
      .update({
        ...parsed.data,
        last_activity_at: now,
        updated_at: now,
      })
      .eq("id", id)

    if (error) {
      console.error("Failed to update CRM client", error)
      return NextResponse.json(
        { error: "Unable to update client right now." },
        { status: 500 }
      )
    }

    const client = await getClientById(id)
    return NextResponse.json({ success: true, client })
  } catch (error) {
    console.error("Unexpected CRM client update error", error)
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
    const { error } = await supabase.from("crm_clients").delete().eq("id", id)

    if (error) {
      console.error("Failed to delete CRM client", error)
      return NextResponse.json(
        { error: "Unable to delete client." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected CRM client delete error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}
