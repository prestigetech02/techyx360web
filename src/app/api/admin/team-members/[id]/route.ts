import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { getTeamMemberById } from "@/lib/team/members"
import { parseUpdateTeamMemberBody } from "@/lib/team/parse-member-body"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    )
  }

  const auth = await requireAdmin()
  if (!auth.authorized) {
    return auth.response
  }

  const { id } = await context.params

  try {
    const member = await getTeamMemberById(id)
    if (!member) {
      return NextResponse.json(
        { error: "Team member not found." },
        { status: 404 }
      )
    }
    return NextResponse.json({ member })
  } catch (error) {
    console.error("Unexpected team member fetch error", error)
    return NextResponse.json(
      { error: "Unable to load team member." },
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

  const auth = await requireAdmin()
  if (!auth.authorized) {
    return auth.response
  }

  const { id } = await context.params

  try {
    const existing = await getTeamMemberById(id)
    if (!existing) {
      return NextResponse.json(
        { error: "Team member not found." },
        { status: 404 }
      )
    }

    const body = (await request.json()) as Record<string, unknown>
    const parsed = parseUpdateTeamMemberBody(body)

    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.error },
        { status: parsed.status }
      )
    }

    const now = new Date().toISOString()
    const supabase = createAdminClient()
    const { error } = await supabase
      .from("team_members")
      .update({
        ...parsed.data,
        updated_at: now,
      })
      .eq("id", id)

    if (error) {
      console.error("Failed to update team member", error)
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A team member with this email already exists." },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: "Unable to update team member right now." },
        { status: 500 }
      )
    }

    const member = await getTeamMemberById(id)
    return NextResponse.json({ success: true, member })
  } catch (error) {
    console.error("Unexpected team member update error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
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

  const auth = await requireAdmin()
  if (!auth.authorized) {
    return auth.response
  }

  const { id } = await context.params

  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from("team_members").delete().eq("id", id)

    if (error) {
      console.error("Failed to delete team member", error)
      return NextResponse.json(
        { error: "Unable to delete team member." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected team member delete error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}
