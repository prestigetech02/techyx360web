import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { getAllTeamMembers, getTeamMemberById } from "@/lib/team/members"
import { parseCreateTeamMemberBody } from "@/lib/team/parse-member-body"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

export async function GET() {
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

  try {
    const members = await getAllTeamMembers()
    return NextResponse.json({ members })
  } catch (error) {
    console.error("Unexpected team members list error", error)
    return NextResponse.json(
      { error: "Unable to load team members." },
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

  const auth = await requireAdmin()
  if (!auth.authorized) {
    return auth.response
  }

  try {
    const body = (await request.json()) as Record<string, unknown>
    const parsed = parseCreateTeamMemberBody(body)

    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.error },
        { status: parsed.status }
      )
    }

    const supabase = createAdminClient()
    const now = new Date().toISOString()
    const { documents, ...memberFields } = parsed.data

    const { data, error } = await supabase
      .from("team_members")
      .insert({
        ...memberFields,
        updated_at: now,
      })
      .select("id")
      .single()

    if (error || !data) {
      console.error("Failed to create team member", error)
      if (error?.code === "23505") {
        return NextResponse.json(
          { error: "A team member with this email already exists." },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: "Unable to create team member right now." },
        { status: 500 }
      )
    }

    if (documents.length > 0) {
      const { error: documentsError } = await supabase
        .from("team_member_documents")
        .insert(
          documents.map((document) => ({
            member_id: data.id,
            title: document.title,
            doc_type: document.doc_type,
            notes: document.notes,
          }))
        )

      if (documentsError) {
        console.error("Failed to create team member documents", documentsError)
      }
    }

    const member = await getTeamMemberById(data.id)
    return NextResponse.json({ success: true, member }, { status: 201 })
  } catch (error) {
    console.error("Unexpected team member create error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}
