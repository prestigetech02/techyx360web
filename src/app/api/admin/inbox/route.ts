import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import {
  getAssigneeNames,
  getLatestMessagePreviews,
  listConversations,
  toConversationView,
} from "@/lib/chat/store"
import {
  isChatConversationStatus,
  type ChatConversationStatus,
} from "@/lib/chat/types"
import { isSupabaseConfigured } from "@/lib/supabase/env"

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    )
  }

  const auth = await requireAdmin("inbox")
  if (!auth.authorized) return auth.response

  const statusParam = new URL(request.url).searchParams.get("status")
  const status =
    statusParam && isChatConversationStatus(statusParam)
      ? (statusParam as ChatConversationStatus)
      : undefined

  try {
    const rows = await listConversations(status)
    const previews = await getLatestMessagePreviews(rows.map((row) => row.id))
    const names = await getAssigneeNames(
      rows.map((row) => row.assignee_id).filter((id): id is string => Boolean(id))
    )

    return NextResponse.json({
      conversations: rows.map((row) =>
        toConversationView(
          row,
          previews.get(row.id) ?? row.handoff_reason,
          row.assignee_id ? names.get(row.assignee_id) ?? null : null
        )
      ),
    })
  } catch (error) {
    console.error("Failed to list inbox conversations", error)
    return NextResponse.json(
      { error: "Unable to load inbox." },
      { status: 500 }
    )
  }
}
