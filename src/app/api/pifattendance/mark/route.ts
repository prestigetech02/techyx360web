import { NextResponse } from "next/server"

import {
  getFellowTeamAttendanceState,
  markPifAttendance,
} from "@/lib/pif/attendance"
import { getPifFellowByEmail } from "@/lib/pif/fellows"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    )
  }

  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getClaims()
    const email =
      typeof data?.claims?.email === "string" ? data.claims.email.trim() : ""

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const fellow = await getPifFellowByEmail(email)
    if (!fellow) {
      return NextResponse.json(
        { error: "This account is not registered as a PIF fellow." },
        { status: 403 }
      )
    }

    const state = await getFellowTeamAttendanceState(fellow.id)

    return NextResponse.json({
      isOpen: state.isOpen,
      sessionLabel: state.sessionLabel,
      alreadyMarked: state.alreadyMarked,
      markedAt: state.markedAt,
      week: state.week,
      day: state.day,
      teamId: state.teamId,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load attendance."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    )
  }

  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getClaims()
    const email =
      typeof data?.claims?.email === "string" ? data.claims.email.trim() : ""

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const fellow = await getPifFellowByEmail(email)
    if (!fellow) {
      return NextResponse.json(
        { error: "This account is not registered as a PIF fellow." },
        { status: 403 }
      )
    }

    if (fellow.status === "inactive") {
      return NextResponse.json(
        { error: "This fellow account is inactive." },
        { status: 403 }
      )
    }

    const record = await markPifAttendance({ fellowId: fellow.id })
    return NextResponse.json({
      success: true,
      record: {
        id: record.id,
        attendanceDate: record.attendance_date,
        markedAt: record.marked_at,
        sessionLabel: record.sessionLabel,
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to mark attendance."
    const status =
      message.includes("closed") ||
      message.includes("already") ||
      message.includes("not assigned")
        ? 400
        : 500
    return NextResponse.json({ error: message }, { status })
  }
}
