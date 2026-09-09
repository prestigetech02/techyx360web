import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import {
  getConversationById,
  insertMessage,
  toMessageView,
  updateConversation,
} from "@/lib/chat/store"
import { CHAT_MAX_MESSAGE_LENGTH } from "@/lib/chat/types"
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

  const auth = await requireAdmin("inbox")
  if (!auth.authorized) return auth.response

  const { id } = await context.params

  let body: Record<string, unknown> = {}
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const text = typeof body.text === "string" ? body.text.trim() : ""
  if (!text) {
    return NextResponse.json({ error: "Type a reply first." }, { status: 400 })
  }
  if (text.length > CHAT_MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: "Keep replies under 2000 characters." },
      { status: 400 }
    )
  }

  try {
    const conversation = await getConversationById(id)
    if (!conversation) {
      return NextResponse.json({ error: "Chat not found." }, { status: 404 })
    }
    if (conversation.status === "closed") {
      return NextResponse.json(
        { error: "This chat is closed." },
        { status: 409 }
      )
    }

    const memberId = auth.access.memberId
    if (conversation.status !== "human" && memberId) {
      await updateConversation(id, {
        status: "human",
        assignee_id: memberId,
      })
    }

    const message = await insertMessage({
      conversationId: id,
      role: "staff",
      content: text,
      staffId: memberId,
    })

    return NextResponse.json({ success: true, message: toMessageView(message) })
  } catch (error) {
    console.error("Failed to send inbox reply", error)
    return NextResponse.json(
      { error: "Unable to send reply." },
      { status: 500 }
    )
  }
}
