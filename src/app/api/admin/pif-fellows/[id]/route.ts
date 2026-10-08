import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { isPifFellowStatus } from "@/lib/pif/fellow-types"
import {
  deletePifFellow,
  getPifFellowById,
  updatePifFellow,
} from "@/lib/pif/fellows"
import { isSupabaseConfigured } from "@/lib/supabase/env"

type RouteContext = {
  params: Promise<{ id: string }>
}

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
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

    if (statusValue && !isPifFellowStatus(statusValue)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 })
    }

    const fellow = await updatePifFellow(id, {
      firstName:
        body.firstName === undefined ? undefined : sanitize(body.firstName),
      lastName:
        body.lastName === undefined ? undefined : sanitize(body.lastName),
      phone: body.phone === undefined ? undefined : sanitize(body.phone),
      status:
        statusValue && isPifFellowStatus(statusValue) ? statusValue : undefined,
      cohortLabel:
        body.cohortLabel === undefined
          ? undefined
          : sanitize(body.cohortLabel),
      preferredTrack:
        body.preferredTrack === undefined
          ? undefined
          : sanitize(body.preferredTrack),
      teamId:
        body.teamId === undefined
          ? undefined
          : sanitize(body.teamId) || null,
      notes: body.notes === undefined ? undefined : sanitize(body.notes),
    })

    return NextResponse.json({ success: true, fellow })
  } catch (error) {
    console.error("Failed to update PIF fellow", error)
    return NextResponse.json(
      { error: "Unable to update fellow." },
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

  const auth = await requireAdmin("academy")
  if (!auth.authorized) return auth.response

  const { id } = await context.params

  try {
    const existing = await getPifFellowById(id)
    if (!existing) {
      return NextResponse.json({ error: "Fellow not found." }, { status: 404 })
    }

    await deletePifFellow(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete PIF fellow", error)
    return NextResponse.json(
      { error: "Unable to delete fellow." },
      { status: 500 }
    )
  }
}
