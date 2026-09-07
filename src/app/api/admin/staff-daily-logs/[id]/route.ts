import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import {
  deleteStaffDailyLog,
  getStaffDailyLogById,
} from "@/lib/work/logs"
import { isSupabaseConfigured } from "@/lib/supabase/env"

type RouteContext = {
  params: Promise<{ id: string }>
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
    const existing = await getStaffDailyLogById(id)
    if (!existing) {
      return NextResponse.json({ error: "Daily log not found." }, { status: 404 })
    }
    if (
      auth.access.kind === "staff" &&
      existing.memberId !== auth.access.memberId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await deleteStaffDailyLog(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected staff daily log delete error", error)
    return NextResponse.json(
      { error: "Unable to delete daily log." },
      { status: 500 }
    )
  }
}
