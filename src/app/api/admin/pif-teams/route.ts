import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { isPifTeamStatus, parsePositiveInt } from "@/lib/pif/team-types"
import { createPifTeam, listPifTeams } from "@/lib/pif/teams"
import { isSupabaseConfigured } from "@/lib/supabase/env"

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

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
    const activeOnly = searchParams.get("activeOnly") === "1"
    const teams = await listPifTeams({ activeOnly })
    return NextResponse.json({ teams })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load teams. Run supabase/pif-teams.sql in Supabase."
    console.error("Failed to load PIF teams", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    )
  }

  const auth = await requireAdmin("academy")
  if (!auth.authorized) return auth.response

  try {
    const body = (await request.json()) as Record<string, unknown>
    const name = sanitize(body.name)
    const cohortLabel = sanitize(body.cohortLabel)
    const description = sanitize(body.description)
    const statusValue = sanitize(body.status) || "active"
    const currentWeek = parsePositiveInt(body.currentWeek, 1, 1, 52)
    const currentDay = parsePositiveInt(body.currentDay, 1, 1, 7)

    if (!name) {
      return NextResponse.json(
        { error: "Team name is required." },
        { status: 400 }
      )
    }

    if (!isPifTeamStatus(statusValue)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 })
    }

    const team = await createPifTeam({
      name,
      cohortLabel,
      description,
      status: statusValue,
      currentWeek,
      currentDay,
    })

    return NextResponse.json({ success: true, team })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create team."
    console.error("Failed to create PIF team", error)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
