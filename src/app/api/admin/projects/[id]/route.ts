import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { touchClientActivity } from "@/lib/crm/clients"
import { parseUpdateProjectBody } from "@/lib/crm/parse-project-body"
import { getProjectById } from "@/lib/crm/projects"
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
    const project = await getProjectById(id)
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 })
    }
    return NextResponse.json({ project })
  } catch (error) {
    console.error("Unexpected CRM project fetch error", error)
    return NextResponse.json(
      { error: "Unable to load project." },
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
    const existing = await getProjectById(id)
    if (!existing) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const parsed = parseUpdateProjectBody(body)

    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.error },
        { status: parsed.status }
      )
    }

    if (parsed.data.client_id) {
      const supabaseCheck = createAdminClient()
      const { data: client, error: clientError } = await supabaseCheck
        .from("crm_clients")
        .select("id")
        .eq("id", parsed.data.client_id)
        .maybeSingle()

      if (clientError) {
        console.error("Failed to verify CRM client for project", clientError)
        return NextResponse.json(
          { error: "Unable to update project right now." },
          { status: 500 }
        )
      }

      if (!client) {
        return NextResponse.json({ error: "Client not found." }, { status: 404 })
      }
    }

    const now = new Date().toISOString()
    const supabase = createAdminClient()
    const { error } = await supabase
      .from("crm_projects")
      .update({
        ...parsed.data,
        updated_at: now,
      })
      .eq("id", id)

    if (error) {
      console.error("Failed to update CRM project", error)
      return NextResponse.json(
        { error: "Unable to update project right now." },
        { status: 500 }
      )
    }

    const clientId = parsed.data.client_id ?? existing.clientId
    if (clientId) {
      try {
        await touchClientActivity(clientId)
      } catch (touchError) {
        console.error("Failed to touch client after project update", touchError)
      }
    }

    const project = await getProjectById(id)
    return NextResponse.json({ success: true, project })
  } catch (error) {
    console.error("Unexpected CRM project update error", error)
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
    const existing = await getProjectById(id)
    if (!existing) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from("crm_projects").delete().eq("id", id)

    if (error) {
      console.error("Failed to delete CRM project", error)
      return NextResponse.json(
        { error: "Unable to delete project." },
        { status: 500 }
      )
    }

    if (existing.clientId) {
      try {
        await touchClientActivity(existing.clientId)
      } catch (touchError) {
        console.error("Failed to touch client after project delete", touchError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected CRM project delete error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}
