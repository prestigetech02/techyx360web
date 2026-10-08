import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { isPifTeamStatus, parsePositiveInt } from "@/lib/pif/team-types"
import {
  deletePifTeam,
  getPifTeamById,
  updatePifTeam,
} from "@/lib/pif/teams"
import { isSupabaseConfigured } from "@/lib/supabase/env"

type RouteContext = {
  params: Promise<{ id: string }>
}

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function GET(_request: Request, context: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    )
  }

  const auth = await requireAdmin("academy")
  if (!auth.authorized) return auth.response

  const { id } = await context.params

  try {
    const team = await getPifTeamById(id)
    if (!team) {
      return NextResponse.json({ error: "Team not found." }, { status: 404 })
    }
    return NextResponse.json({ team })
  } catch (error) {
    console.error("Failed to load PIF team", error)
    return NextResponse.json(
      { error: "Unable to load team." },
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

  const auth = await requireAdmin("academy")
  if (!auth.authorized) return auth.response

  const { id } = await context.params

  try {
    const body = (await request.json()) as Record<string, unknown>
    const statusValue = sanitize(body.status)

    if (statusValue && !isPifTeamStatus(statusValue)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 })
    }

    const team = await updatePifTeam(id, {
      name: body.name === undefined ? undefined : sanitize(body.name),
      cohortLabel:
        body.cohortLabel === undefined
          ? undefined
          : sanitize(body.cohortLabel),
      description:
        body.description === undefined
          ? undefined
          : sanitize(body.description),
      status:
        statusValue && isPifTeamStatus(statusValue) ? statusValue : undefined,
      attendanceOpen:
        body.attendanceOpen === undefined
          ? undefined
          : Boolean(body.attendanceOpen),
      currentWeek:
        body.currentWeek === undefined
          ? undefined
          : parsePositiveInt(body.currentWeek, 1, 1, 52),
      currentDay:
        body.currentDay === undefined
          ? undefined
          : parsePositiveInt(body.currentDay, 1, 1, 7),
    })

    return NextResponse.json({ success: true, team })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update team."
    console.error("Failed to update PIF team", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    )
  }

  const auth = await requireAdmin("academy")
  if (!auth.authorized) return auth.response

  const { id } = await context.params

  try {
    const existing = await getPifTeamById(id)
    if (!existing) {
      return NextResponse.json({ error: "Team not found." }, { status: 404 })
    }

    await deletePifTeam(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete PIF team", error)
    return NextResponse.json(
      { error: "Unable to delete team." },
      { status: 500 }
    )
  }
}
