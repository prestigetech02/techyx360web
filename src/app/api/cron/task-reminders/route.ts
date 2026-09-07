import { NextResponse } from "next/server"

import { isSupabaseConfigured } from "@/lib/supabase/env"
import {
  isTaskReminderEmailConfigured,
  runTaskReminders,
} from "@/lib/work/reminders"

export const runtime = "nodejs"
export const maxDuration = 60

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) return false
  const header = request.headers.get("authorization")
  return header === `Bearer ${secret}`
}

export async function POST(request: Request) {
  return GET(request)
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    )
  }

  if (!isTaskReminderEmailConfigured()) {
    return NextResponse.json(
      {
        error:
          "Email is not configured. Add ZEPTOMAIL_TOKEN and ZEPTOMAIL_FROM_EMAIL to your environment variables.",
      },
      { status: 500 }
    )
  }

  try {
    const result = await runTaskReminders()
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error("Task reminder cron failed", error)
    const message =
      error instanceof Error ? error.message : "Unable to send task reminders."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
