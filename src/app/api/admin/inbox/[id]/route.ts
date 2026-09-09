import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import {
  getAssigneeNames,
  getConversationById,
  getLatestMessagePreviews,
  insertMessage,
  listMessages,
  toConversationView,
  toMessageView,
  updateConversation,
} from "@/lib/chat/store"
import { isChatConversationStatus } from "@/lib/chat/types"
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

  const auth = await requireAdmin("inbox")
  if (!auth.authorized) return auth.response

  const { id } = await context.params

  try {
    const conversation = await getConversationById(id)
    if (!conversation) {
      return NextResponse.json({ error: "Chat not found." }, { status: 404 })
    }

    const [messages, names, previews] = await Promise.all([
      listMessages(conversation.id),
      getAssigneeNames(conversation.assignee_id ? [conversation.assignee_id] : []),
      getLatestMessagePreviews([conversation.id]),
    ])

    return NextResponse.json({
      conversation: toConversationView(
        conversation,
        previews.get(conversation.id) ?? "",
        conversation.assignee_id
          ? names.get(conversation.assignee_id) ?? null
          : null
      ),
      messages: messages.map(toMessageView),
    })
  } catch (error) {
    console.error("Failed to load inbox conversation", error)
    return NextResponse.json(
      { error: "Unable to load chat." },
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

  const auth = await requireAdmin("inbox")
  if (!auth.authorized) return auth.response

  const { id } = await context.params

  let body: Record<string, unknown> = {}
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const action = typeof body.action === "string" ? body.action.trim() : ""

  try {
    const conversation = await getConversationById(id)
    if (!conversation) {
      return NextResponse.json({ error: "Chat not found." }, { status: 404 })
    }

    const memberId = auth.access.memberId

    if (action === "claim") {
      const next = await updateConversation(id, {
        status: "human",
        assignee_id: memberId ?? conversation.assignee_id,
      })
      await insertMessage({
        conversationId: id,
        role: "system",
        content: "A teammate joined this chat.",
      })
      return NextResponse.json({ conversation: toConversationView(next) })
    }

    if (action === "close") {
      const next = await updateConversation(id, { status: "closed" })
      await insertMessage({
        conversationId: id,
        role: "system",
        content: "This chat was closed.",
      })
      return NextResponse.json({ conversation: toConversationView(next) })
    }

    if (action === "return_to_bot") {
      const next = await updateConversation(id, {
        status: "bot",
        assignee_id: null,
        handoff_reason: "",
      })
      await insertMessage({
        conversationId: id,
        role: "system",
        content: "A teammate returned this chat to the assistant.",
      })
      return NextResponse.json({ conversation: toConversationView(next) })
    }

    if (action === "status") {
      const status = typeof body.status === "string" ? body.status : ""
      if (!isChatConversationStatus(status)) {
        return NextResponse.json({ error: "Invalid status." }, { status: 400 })
      }
      const next = await updateConversation(id, { status })
      return NextResponse.json({ conversation: toConversationView(next) })
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 })
  } catch (error) {
    console.error("Failed to update inbox conversation", error)
    return NextResponse.json(
      { error: "Unable to update chat." },
      { status: 500 }
    )
  }
}
