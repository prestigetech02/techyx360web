import { NextResponse } from "next/server"

import { extractChatText } from "@/lib/chat/message-utils"
import { resolveVisitorConversation } from "@/lib/chat/request"
import { insertMessage, toMessageView } from "@/lib/chat/store"
import {
  CHAT_MAX_MESSAGE_LENGTH,
} from "@/lib/chat/types"
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
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const text = extractChatText(body)
  if (!text) {
    return NextResponse.json({ error: "Type a message first." }, { status: 400 })
  }
  if (text.length > CHAT_MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: "Keep messages under 2000 characters." },
      { status: 400 }
    )
  }

  try {
    const resolved = await resolveVisitorConversation(request, body, {
      createIfMissing: false,
    })
    if (!resolved.ok) return resolved.response
    if (!resolved.conversation || resolved.conversation.status === "closed") {
      return NextResponse.json(
        { error: "This chat is closed. Start a new one." },
        { status: 409 }
      )
    }

    if (resolved.conversation.status === "bot") {
      return NextResponse.json(
        { error: "Send this message through the assistant." },
        { status: 409 }
      )
    }

    const message = await insertMessage({
      conversationId: resolved.conversation.id,
      role: "user",
      content: text,
    })

    return NextResponse.json({
      success: true,
      message: toMessageView(message),
    })
  } catch (error) {
    console.error("Visitor chat message failed", error)
    return NextResponse.json(
      { error: "Unable to send your message." },
      { status: 500 }
    )
  }
}
