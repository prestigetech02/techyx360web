import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { parseUpsertStaffDailyLogBody } from "@/lib/work/parse-log-body"
import {
  getStaffDailyLogs,
  upsertStaffDailyLog,
} from "@/lib/work/logs"
import { assertTeamMemberExists } from "@/lib/work/tasks"
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
    const logs = await getStaffDailyLogs(
      auth.access.kind === "staff"
        ? { memberId: auth.access.memberId }
        : undefined
    )
    return NextResponse.json({ logs })
  } catch (error) {
    console.error("Unexpected staff daily logs list error", error)
    return NextResponse.json(
      { error: "Unable to load daily logs." },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
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
    const parsed = parseUpsertStaffDailyLogBody(body)

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
      parsed.data.member_id = auth.access.memberId
    }

    const exists = await assertTeamMemberExists(parsed.data.member_id)
    if (!exists) {
      return NextResponse.json(
        { error: "Team member not found." },
        { status: 404 }
      )
    }

    const log = await upsertStaffDailyLog({
      ...parsed.data,
      created_by: auth.email,
    })

    return NextResponse.json({ success: true, log })
  } catch (error) {
    console.error("Unexpected staff daily log save error", error)
    return NextResponse.json(
      { error: "Unable to save daily log." },
      { status: 500 }
    )
  }
}
