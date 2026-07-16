import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { touchClientActivity } from "@/lib/crm/clients"
import { parseCreateProjectBody } from "@/lib/crm/parse-project-body"
import { getAllProjects, getProjectById } from "@/lib/crm/projects"
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
    const projects = await getAllProjects()
    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Unexpected CRM projects list error", error)
    return NextResponse.json(
      { error: "Unable to load projects." },
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
    const parsed = parseCreateProjectBody(body)

    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.error },
        { status: parsed.status }
      )
    }

    const supabase = createAdminClient()
    const now = new Date().toISOString()

    const { data: client, error: clientError } = await supabase
      .from("crm_clients")
      .select("id")
      .eq("id", parsed.data.client_id)
      .maybeSingle()

    if (clientError) {
      console.error("Failed to verify CRM client for project", clientError)
      return NextResponse.json(
        { error: "Unable to create project right now." },
        { status: 500 }
      )
    }

    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 })
    }

    const { data, error } = await supabase
      .from("crm_projects")
      .insert({
        ...parsed.data,
        updated_at: now,
      })
      .select("id")
      .single()

    if (error || !data) {
      console.error("Failed to create CRM project", error)
      return NextResponse.json(
        { error: "Unable to create project right now." },
        { status: 500 }
      )
    }

    try {
      await touchClientActivity(parsed.data.client_id)
    } catch (touchError) {
      console.error("Failed to touch client after project create", touchError)
    }

    const project = await getProjectById(data.id)
    return NextResponse.json({ success: true, project }, { status: 201 })
  } catch (error) {
    console.error("Unexpected CRM project create error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}
