import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { getTeamMemberById } from "@/lib/team/members"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

type RouteContext = {
  params: Promise<{ id: string; documentId: string }>
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

  const { id, documentId } = await context.params

  try {
    const existing = await getTeamMemberById(id)
    if (!existing) {
      return NextResponse.json(
        { error: "Team member not found." },
        { status: 404 }
      )
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from("team_member_documents")
      .delete()
      .eq("id", documentId)
      .eq("member_id", id)

    if (error) {
      console.error("Failed to delete team member document", error)
      return NextResponse.json(
        { error: "Unable to delete document." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected team member document delete error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}
