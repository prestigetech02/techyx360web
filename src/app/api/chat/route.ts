import { openai } from "@ai-sdk/openai"
import {
  convertToModelMessages,
  isStepCount,
  streamText,
  tool,
  type UIMessage,
} from "ai"
import { NextResponse } from "next/server"
import { z } from "zod"

import { getChatOfferings, buildChatSystemPrompt } from "@/lib/chat/knowledge"
import { dbMessagesToUiMessages, extractChatText } from "@/lib/chat/message-utils"
import { resolveVisitorConversation } from "@/lib/chat/request"
import {
  countRecentUserMessages,
  insertMessage,
  listMessages,
  updateConversation,
} from "@/lib/chat/store"
import {
  CHAT_MAX_MESSAGE_LENGTH,
  CHAT_MAX_USER_MESSAGES_PER_HOUR,
} from "@/lib/chat/types"
import { isSupabaseConfigured } from "@/lib/supabase/env"

export const maxDuration = 60

function isOpenAiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY)
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Chat is not available right now." },
      { status: 500 }
    )
  }

  if (!isOpenAiConfigured()) {
    return NextResponse.json(
      { error: "The assistant is not connected yet." },
      { status: 503 }
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
      createIfMissing: true,
    })
    if (!resolved.ok) return resolved.response
    if (!resolved.conversation) {
      return NextResponse.json(
        { error: "Unable to start chat." },
        { status: 500 }
      )
    }

    const conversation = resolved.conversation
    if (conversation.status !== "bot") {
      return NextResponse.json(
        {
          error: "A teammate is handling this chat.",
          status: conversation.status,
        },
        { status: 409 }
      )
    }

    const recent = await countRecentUserMessages(conversation.id)
    if (recent >= CHAT_MAX_USER_MESSAGES_PER_HOUR) {
      return NextResponse.json(
        { error: "Too many messages. Please wait a bit and try again." },
        { status: 429 }
      )
    }

    await insertMessage({
      conversationId: conversation.id,
      role: "user",
      content: text,
    })

    const history = await listMessages(conversation.id)
    const uiHistory: UIMessage[] = dbMessagesToUiMessages(history)

    const result = streamText({
      model: openai("gpt-4.1-mini"),
      system: buildChatSystemPrompt(),
      messages: await convertToModelMessages(uiHistory),
      stopWhen: isStepCount(5),
      tools: {
        listOfferings: tool({
          description:
            "Look up Techyx360 services, training courses, bootcamps, and flagged programs before answering.",
          inputSchema: z.object({
            kind: z
              .enum(["all", "services", "courses", "bootcamps", "programs"])
              .optional(),
          }),
          execute: async ({ kind }) => {
            const offerings = getChatOfferings()
            const selected = kind ?? "all"
            if (selected === "all") return offerings
            return { [selected]: offerings[selected] }
          },
        }),
        saveVisitorContact: tool({
          description:
            "Save the visitor's name, email, or phone on this conversation when they share it.",
          inputSchema: z.object({
            name: z.string().optional(),
            email: z.string().optional(),
            phone: z.string().optional(),
          }),
          execute: async ({ name, email, phone }) => {
            const patch: {
              visitor_name?: string
              visitor_email?: string
              visitor_phone?: string
            } = {}
            if (name?.trim()) patch.visitor_name = name.trim().slice(0, 120)
            if (email?.trim()) patch.visitor_email = email.trim().slice(0, 200)
            if (phone?.trim()) patch.visitor_phone = phone.trim().slice(0, 40)
            if (Object.keys(patch).length === 0) {
              return { saved: false, reason: "No contact fields provided." }
            }
            await updateConversation(conversation.id, patch)
            return { saved: true }
          },
        }),
        offerTalkToPerson: tool({
          description:
            "Show a Talk to a person button when you cannot complete the request, the visitor asks for a human, or a teammate should take over. Do not use this for ordinary answered questions.",
          inputSchema: z.object({
            reason: z
              .string()
              .describe("Short reason a teammate should join.")
              .max(400),
          }),
          execute: async ({ reason }) => {
            await insertMessage({
              conversationId: conversation.id,
              role: "system",
              content: `OFFER_HUMAN_HANDOFF:${reason.trim()}`,
            })
            return {
              offered: true,
              message:
                "A Talk to a person button is now visible. Tell the visitor they can tap it to reach a teammate.",
            }
          },
        }),
      },
      onFinish: async ({ text: assistantText }) => {
        const content = assistantText.trim()
        if (!content) return
        await insertMessage({
          conversationId: conversation.id,
          role: "assistant",
          content,
        })
      },
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("Chat stream failed", error)
    return NextResponse.json(
      { error: "Unable to reply right now." },
      { status: 500 }
    )
  }
}
