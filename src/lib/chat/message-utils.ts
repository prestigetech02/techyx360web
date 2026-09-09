import type { UIMessage } from "ai"

import type { ChatMessageRecord } from "@/lib/chat/types"

export function extractChatText(body: unknown) {
  if (!body || typeof body !== "object") return ""
  const record = body as Record<string, unknown>
  if (typeof record.text === "string" && record.text.trim()) {
    return record.text.trim()
  }

  const message = record.message
  if (message && typeof message === "object") {
    const fromParts = textFromParts((message as { parts?: unknown }).parts)
    if (fromParts) return fromParts
  }

  if (Array.isArray(record.messages) && record.messages.length > 0) {
    const last = record.messages[record.messages.length - 1] as {
      parts?: unknown
      content?: unknown
    }
    const fromParts = textFromParts(last?.parts)
    if (fromParts) return fromParts
    if (typeof last?.content === "string") return last.content.trim()
  }

  return ""
}

function textFromParts(parts: unknown) {
  if (!Array.isArray(parts)) return ""
  return parts
    .map((part) => {
      if (!part || typeof part !== "object") return ""
      const item = part as { type?: unknown; text?: unknown }
      if (item.type === "text" && typeof item.text === "string") return item.text
      return ""
    })
    .join("")
    .trim()
}

export function sanitizePagePath(value: unknown) {
  const raw = typeof value === "string" ? value.trim() : ""
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/"
  return raw.slice(0, 200)
}

export function dbMessagesToUiMessages(
  messages: ChatMessageRecord[]
): UIMessage[] {
  return messages
    .filter((item) => item.role !== "system")
    .map((item) => ({
      id: item.id,
      role: item.role === "user" ? "user" : "assistant",
      parts: [{ type: "text" as const, text: item.content }],
    }))
}
