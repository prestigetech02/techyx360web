import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { parseUpdateStaffTaskBody } from "@/lib/work/parse-task-body"
import {
  assertTeamMemberExists,
  getStaffTaskById,
} from "@/lib/work/tasks"
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

  const auth = await requireAdmin("work")
  if (!auth.authorized) {
    return auth.response
  }

  const { id } = await context.params

  try {
    const task = await getStaffTaskById(id)
    if (!task) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 })
    }
    if (
      auth.access.kind === "staff" &&
      task.assigneeId !== auth.access.memberId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ task })
  } catch (error) {
    console.error("Unexpected staff task fetch error", error)
    return NextResponse.json(
      { error: "Unable to load task." },
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

  const auth = await requireAdmin("work")
  if (!auth.authorized) {
    return auth.response
  }

  const { id } = await context.params

  try {
    const existing = await getStaffTaskById(id)
    if (!existing) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 })
    }
    if (
      auth.access.kind === "staff" &&
      existing.assigneeId !== auth.access.memberId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const parsed = parseUpdateStaffTaskBody(body)

    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.error },
        { status: parsed.status }
      )
    }

    if (auth.access.kind === "staff") {
      parsed.data.assignee_id = auth.access.memberId
    }

    if (parsed.data.assignee_id) {
      const exists = await assertTeamMemberExists(parsed.data.assignee_id)
      if (!exists) {
        return NextResponse.json(
          { error: "Team member not found." },
          { status: 404 }
        )
      }
    }

    const supabase = createAdminClient()
    const now = new Date().toISOString()
    const { error } = await supabase
      .from("staff_tasks")
      .update({
        ...parsed.data,
        updated_at: now,
      })
      .eq("id", id)

    if (error) {
      console.error("Failed to update staff task", error)
      return NextResponse.json(
        { error: "Unable to update task right now." },
        { status: 500 }
      )
    }

    const task = await getStaffTaskById(id)
    return NextResponse.json({ success: true, task })
  } catch (error) {
    console.error("Unexpected staff task update error", error)
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

  const auth = await requireAdmin("work")
  if (!auth.authorized) {
    return auth.response
  }

  const { id } = await context.params

  try {
    const existing = await getStaffTaskById(id)
    if (!existing) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 })
    }
    if (
      auth.access.kind === "staff" &&
      existing.assigneeId !== auth.access.memberId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from("staff_tasks").delete().eq("id", id)

    if (error) {
      console.error("Failed to delete staff task", error)
      return NextResponse.json(
        { error: "Unable to delete task." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected staff task delete error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}
