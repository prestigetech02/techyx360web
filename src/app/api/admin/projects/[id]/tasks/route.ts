import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { touchClientActivity } from "@/lib/crm/clients"
import { parseCreateTaskBody } from "@/lib/crm/parse-project-body"
import { getProjectById } from "@/lib/crm/projects"
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

  const { id: projectId } = await context.params

  try {
    const existing = await getProjectById(projectId)
    if (!existing) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const parsed = parseCreateTaskBody(body)

    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.error },
        { status: parsed.status }
      )
    }

    const supabase = createAdminClient()
    const sortOrder = existing.tasks.length

    const { error } = await supabase.from("crm_project_tasks").insert({
      project_id: projectId,
      title: parsed.data.title,
      assignee: parsed.data.assignee,
      done: parsed.data.done,
      sort_order: sortOrder,
    })

    if (error) {
      console.error("Failed to create project task", error)
      return NextResponse.json(
        { error: "Unable to add task." },
        { status: 500 }
      )
    }

    await supabase
      .from("crm_projects")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", projectId)

    if (existing.clientId) {
      try {
        await touchClientActivity(existing.clientId)
      } catch (touchError) {
        console.error("Failed to touch client after task create", touchError)
      }
    }

    const project = await getProjectById(projectId)
    return NextResponse.json({ success: true, project }, { status: 201 })
  } catch (error) {
    console.error("Unexpected project task create error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}
