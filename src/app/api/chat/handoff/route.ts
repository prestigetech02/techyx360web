import { NextResponse } from "next/server"

import { missingLeadFields } from "@/lib/chat/contact"
import { resolveVisitorConversation } from "@/lib/chat/request"
import {
  insertMessage,
  toConversationView,
  updateConversation,
} from "@/lib/chat/store"
import { isSupabaseConfigured } from "@/lib/supabase/env"

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Chat is not available right now." },
      { status: 500 }
    )
  }

  let body: Record<string, unknown> = {}
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    body = {}
  }

  const reason =
    typeof body.reason === "string" && body.reason.trim()
      ? body.reason.trim().slice(0, 400)
      : "Visitor asked to talk to a person."

  try {
    const resolved = await resolveVisitorConversation(request, body, {
      createIfMissing: true,
    })
    if (!resolved.ok) return resolved.response
    if (!resolved.conversation) {
      return NextResponse.json(
        { error: "Unable to start chat." },
        { status: 500 }
      )
    }

    if (
      resolved.conversation.status === "waiting" ||
      resolved.conversation.status === "human"
    ) {
      return NextResponse.json({
        success: true,
        conversation: toConversationView(resolved.conversation),
      })
    }

    if (resolved.conversation.status === "closed") {
      return NextResponse.json(
        { error: "This chat is closed. Start a new one." },
        { status: 409 }
      )
    }

    const missing = missingLeadFields(resolved.conversation)
    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: `Please share your ${missing.join(", ")} first so we can reach you.`,
          missing,
        },
        { status: 400 }
      )
    }

    const conversation = await updateConversation(resolved.conversation.id, {
      status: "waiting",
      handoff_reason: reason,
    })

    await insertMessage({
      conversationId: conversation.id,
      role: "system",
      content: `Handoff requested: ${reason}`,
    })

    await insertMessage({
      conversationId: conversation.id,
      role: "assistant",
      content:
        "I've asked a teammate to join this chat. You can keep typing here.",
    })

    return NextResponse.json({
      success: true,
      conversation: toConversationView(conversation),
    })
  } catch (error) {
    console.error("Chat handoff failed", error)
    return NextResponse.json(
      { error: "Unable to reach a teammate right now." },
      { status: 500 }
    )
  }
}
