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

import { applyContactPatch, missingLeadFields } from "@/lib/chat/contact"
import { getChatOfferings, buildChatSystemPrompt } from "@/lib/chat/knowledge"
import { dbMessagesToUiMessages, extractChatText } from "@/lib/chat/message-utils"
import { resolveVisitorConversation } from "@/lib/chat/request"
import {
  countRecentUserMessages,
  getConversationById,
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
      system: buildChatSystemPrompt(conversation),
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
            "Save the visitor's full name, email, or phone when they share it. Call this before starting a handoff.",
          inputSchema: z.object({
            name: z.string().optional().describe("Full name, first and last."),
            email: z.string().optional(),
            phone: z.string().optional(),
          }),
          execute: async ({ name, email, phone }) => {
            const current =
              (await getConversationById(conversation.id)) ?? conversation
            const next = applyContactPatch(current, { name, email, phone })
            if (
              next.visitor_name === current.visitor_name &&
              next.visitor_email === current.visitor_email &&
              next.visitor_phone === current.visitor_phone
            ) {
              return {
                saved: false,
                complete: missingLeadFields(current).length === 0,
                missing: missingLeadFields(current),
                reason: "No new contact fields provided.",
              }
            }
            await updateConversation(conversation.id, next)
            const missing = missingLeadFields(next)
            return {
              saved: true,
              complete: missing.length === 0,
              missing,
            }
          },
        }),
        offerTalkToPerson: tool({
          description:
            "Start a human handoff after the visitor's full name, email, and phone are saved. Do not call this until those three fields are complete.",
          inputSchema: z.object({
            reason: z
              .string()
              .describe("Short reason a teammate should join.")
              .max(400),
          }),
          execute: async ({ reason }) => {
            const current =
              (await getConversationById(conversation.id)) ?? conversation
            const missing = missingLeadFields(current)
            if (missing.length > 0) {
              return {
                handedOff: false,
                missing,
                message: `Ask for: ${missing.join(", ")}. Then call saveVisitorContact, then call this tool again.`,
              }
            }

            await updateConversation(conversation.id, {
              status: "waiting",
              handoff_reason: reason.trim().slice(0, 400),
            })
            await insertMessage({
              conversationId: conversation.id,
              role: "system",
              content: `Handoff requested: ${reason.trim()}`,
            })
            return {
              handedOff: true,
              message:
                "A teammate will join this chat. Confirm that to the visitor briefly.",
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
