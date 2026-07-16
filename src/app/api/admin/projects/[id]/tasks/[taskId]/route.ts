import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { touchClientActivity } from "@/lib/crm/clients"
import { parseUpdateTaskBody } from "@/lib/crm/parse-project-body"
import { getProjectById } from "@/lib/crm/projects"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

type RouteContext = {
  params: Promise<{ id: string; taskId: string }>
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

  const { id: projectId, taskId } = await context.params

  try {
    const existing = await getProjectById(projectId)
    if (!existing) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 })
    }

    if (!existing.tasks.some((task) => task.id === taskId)) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const parsed = parseUpdateTaskBody(body)

    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.error },
        { status: parsed.status }
      )
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from("crm_project_tasks")
      .update(parsed.data)
      .eq("id", taskId)
      .eq("project_id", projectId)

    if (error) {
      console.error("Failed to update project task", error)
      return NextResponse.json(
        { error: "Unable to update task." },
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
        console.error("Failed to touch client after task update", touchError)
      }
    }

    const project = await getProjectById(projectId)
    return NextResponse.json({ success: true, project })
  } catch (error) {
    console.error("Unexpected project task update error", error)
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

  const { id: projectId, taskId } = await context.params

  try {
    const existing = await getProjectById(projectId)
    if (!existing) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from("crm_project_tasks")
      .delete()
      .eq("id", taskId)
      .eq("project_id", projectId)

    if (error) {
      console.error("Failed to delete project task", error)
      return NextResponse.json(
        { error: "Unable to delete task." },
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
        console.error("Failed to touch client after task delete", touchError)
      }
    }

    const project = await getProjectById(projectId)
    return NextResponse.json({ success: true, project })
  } catch (error) {
    console.error("Unexpected project task delete error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}
