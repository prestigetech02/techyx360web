import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import {
  getAttendanceSummary,
  listAttendanceHistory,
} from "@/lib/pif/attendance"
import { isSupabaseConfigured } from "@/lib/supabase/env"

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    )
  }

  const auth = await requireAdmin("academy")
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get("teamId") || undefined
    const weekRaw = searchParams.get("week")
    const week = weekRaw ? Number.parseInt(weekRaw, 10) : undefined

    const [summary, history] = await Promise.all([
      getAttendanceSummary(),
      listAttendanceHistory({
        teamId,
        week: Number.isInteger(week) ? week : undefined,
        limit: 200,
      }),
    ])

    return NextResponse.json({ summary, history })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load attendance history."
    console.error("Failed to load PIF attendance", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
