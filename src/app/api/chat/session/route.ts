import { NextResponse } from "next/server"

import { dbMessagesToUiMessages } from "@/lib/chat/message-utils"
import { resolveVisitorConversation } from "@/lib/chat/request"
import { createConversation, insertMessage, listMessages, toConversationView, toMessageView, updateConversation } from "@/lib/chat/store"
import { isSupabaseConfigured } from "@/lib/supabase/env"

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Chat is not available right now." },
      { status: 500 }
    )
  }

  try {
    const resolved = await resolveVisitorConversation(request, {}, {
      createIfMissing: false,
    })
    if (!resolved.ok) return resolved.response

    if (!resolved.conversation || resolved.conversation.status === "closed") {
      return NextResponse.json({
        conversation: null,
        messages: [],
        uiMessages: [],
      })
    }

    const messages = await listMessages(resolved.conversation.id)
    return NextResponse.json({
      conversation: toConversationView(resolved.conversation),
      messages: messages.map(toMessageView),
      uiMessages: dbMessagesToUiMessages(messages),
    })
  } catch (error) {
    console.error("Chat session load failed", error)
    return NextResponse.json(
      { error: "Unable to load chat." },
      { status: 500 }
    )
  }
}

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

  try {
    const resolved = await resolveVisitorConversation(request, body, {
      createIfMissing: false,
    })
    if (!resolved.ok) return resolved.response

    if (body.action === "new") {
      const conversation = await createConversation({
        visitorTokenHash: resolved.visitorTokenHash,
        pagePath: resolved.pagePath,
      })
      return NextResponse.json({
        conversation: toConversationView(conversation),
        messages: [],
        uiMessages: [],
      })
    }

    if (body.action === "end") {
      if (
        resolved.conversation &&
        resolved.conversation.status !== "closed"
      ) {
        await updateConversation(resolved.conversation.id, {
          status: "closed",
        })
        await insertMessage({
          conversationId: resolved.conversation.id,
          role: "system",
          content: "Visitor ended this chat.",
        })
      }
      return NextResponse.json({
        conversation: null,
        messages: [],
        uiMessages: [],
      })
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 })
  } catch (error) {
    console.error("Chat session update failed", error)
    return NextResponse.json(
      { error: "Unable to start a new chat." },
      { status: 500 }
    )
  }
}
