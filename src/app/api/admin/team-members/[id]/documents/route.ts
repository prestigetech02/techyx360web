import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { getTeamMemberById } from "@/lib/team/members"
import { parseCreateDocumentBody } from "@/lib/team/parse-member-body"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, context: RouteContext) {
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
    const parsed = parseCreateDocumentBody(body)

    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.error },
        { status: parsed.status }
      )
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from("team_member_documents").insert({
      member_id: id,
      title: parsed.data.title,
      doc_type: parsed.data.doc_type,
      notes: parsed.data.notes,
    })

    if (error) {
      console.error("Failed to create team member document", error)
      return NextResponse.json(
        { error: "Unable to add document right now." },
        { status: 500 }
      )
    }

    const member = await getTeamMemberById(id)
    return NextResponse.json({ success: true, member }, { status: 201 })
  } catch (error) {
    console.error("Unexpected team member document create error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}
