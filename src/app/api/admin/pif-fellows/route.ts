import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { isPifFellowStatus } from "@/lib/pif/fellow-types"
import {
  createPifFellow,
  getPifFellowsPageData,
} from "@/lib/pif/fellows"
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
    const data = await getPifFellowsPageData({
      page: searchParams.get("page") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    })
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to load PIF fellows", error)
    return NextResponse.json(
      {
        error:
          "Unable to load fellows. Run supabase/pif-fellows.sql in Supabase.",
      },
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

  const auth = await requireAdmin("academy")
  if (!auth.authorized) return auth.response

  try {
    const body = (await request.json()) as Record<string, unknown>
    const firstName = sanitize(body.firstName)
    const lastName = sanitize(body.lastName)
    const email = sanitize(body.email).toLowerCase()
    const phone = sanitize(body.phone)
    const cohortLabel = sanitize(body.cohortLabel)
    const preferredTrack = sanitize(body.preferredTrack)
    const teamId = sanitize(body.teamId) || null
    const notes = sanitize(body.notes)
    const statusValue = sanitize(body.status) || "invited"

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First and last name are required." },
        { status: 400 }
      )
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      )
    }

    if (!isPifFellowStatus(statusValue)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 })
    }

    const fellow = await createPifFellow({
      firstName,
      lastName,
      email,
      phone,
      cohortLabel,
      preferredTrack,
      teamId,
      notes,
      status: statusValue,
    })

    return NextResponse.json({ success: true, fellow })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create fellow."
    console.error("Failed to create PIF fellow", error)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
