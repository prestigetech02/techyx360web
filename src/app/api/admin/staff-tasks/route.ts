import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { parseCreateStaffTaskBody } from "@/lib/work/parse-task-body"
import {
  assertTeamMemberExists,
  getAllStaffTasks,
  getStaffTaskById,
} from "@/lib/work/tasks"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

export async function GET() {
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

  try {
    const tasks = await getAllStaffTasks(
      auth.access.kind === "staff" ? { assigneeId: auth.access.memberId } : undefined
    )
    return NextResponse.json({ tasks })
  } catch (error) {
    console.error("Unexpected staff tasks list error", error)
    return NextResponse.json(
      { error: "Unable to load staff tasks." },
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

  const auth = await requireAdmin("work")
  if (!auth.authorized) {
    return auth.response
  }

  try {
    const body = (await request.json()) as Record<string, unknown>
    const parsed = parseCreateStaffTaskBody(body)

    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.error },
        { status: parsed.status }
      )
    }

    if (auth.access.kind === "staff") {
      if (!auth.access.memberId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
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

    const { data, error } = await supabase
      .from("staff_tasks")
      .insert({
        ...parsed.data,
        created_by: auth.email,
        updated_at: now,
      })
      .select("id")
      .single()

    if (error || !data) {
      console.error("Failed to create staff task", error)
      return NextResponse.json(
        { error: "Unable to create task right now." },
        { status: 500 }
      )
    }

    const task = await getStaffTaskById(data.id)
    return NextResponse.json({ success: true, task }, { status: 201 })
  } catch (error) {
    console.error("Unexpected staff task create error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}
