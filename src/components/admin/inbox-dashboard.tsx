"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { contactDetails } from "@/config/contact"
import {
  OFFER_HUMAN_HANDOFF,
  type ChatConversationStatus,
  type ChatConversationView,
  type ChatMessageView,
} from "@/lib/chat/types"
import { createClient } from "@/lib/supabase/client"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { cn } from "@/lib/utils"

const FILTERS: Array<{ id: "all" | ChatConversationStatus; label: string }> = [
  { id: "all", label: "All" },
  { id: "waiting", label: "Waiting" },
  { id: "human", label: "Live" },
  { id: "bot", label: "Bot" },
  { id: "closed", label: "Closed" },
]

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function visitorLabel(item: ChatConversationView) {
  if (item.visitorName.trim()) return item.visitorName
  if (item.visitorEmail.trim()) return item.visitorEmail
  return "Site visitor"
}

function statusLabel(status: ChatConversationStatus) {
  if (status === "waiting") return "Waiting"
  if (status === "human") return "Live"
  if (status === "closed") return "Closed"
  return "Bot"
}

export function InboxDashboard({
  initialConversationId,
}: {
  initialConversationId?: string | null
}) {
  const router = useRouter()
  const [filter, setFilter] = useState<"all" | ChatConversationStatus>("all")
  const [conversations, setConversations] = useState<ChatConversationView[]>(
    []
  )
  const [selectedId, setSelectedId] = useState<string | null>(
    initialConversationId ?? null
  )
  const [messages, setMessages] = useState<ChatMessageView[]>([])
  const [selected, setSelected] = useState<ChatConversationView | null>(null)
  const [reply, setReply] = useState("")
  const [loadError, setLoadError] = useState("")
  const [busy, setBusy] = useState(false)

  const loadList = useCallback(async () => {
    const query = filter === "all" ? "" : `?status=${filter}`
    const response = await fetch(`/api/admin/inbox${query}`)
    if (!response.ok) {
      setLoadError("Could not load chats. Run supabase/chat-inbox.sql if this is the first time.")
      return
    }
    const payload = (await response.json()) as {
      conversations: ChatConversationView[]
    }
    setLoadError("")
    setConversations(payload.conversations)
  }, [filter])

  const loadThread = useCallback(async (id: string) => {
    const response = await fetch(`/api/admin/inbox/${id}`)
    if (!response.ok) return
    const payload = (await response.json()) as {
      conversation: ChatConversationView
      messages: ChatMessageView[]
    }
    setSelected(payload.conversation)
    setMessages(payload.messages)
  }, [])

  useEffect(() => {
    void loadList()
  }, [loadList])

  useEffect(() => {
    if (!selectedId) {
      setSelected(null)
      setMessages([])
      return
    }
    void loadThread(selectedId)
  }, [loadThread, selectedId])

  useEffect(() => {
    if (!isSupabaseConfigured()) return
    const supabase = createClient()
    const channel = supabase
      .channel("admin-chat-inbox")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_conversations" },
        () => {
          void loadList()
          if (selectedId) void loadThread(selectedId)
          router.refresh()
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const row = payload.new as { conversation_id?: string }
          if (row.conversation_id && row.conversation_id === selectedId) {
            void loadThread(selectedId)
          }
          void loadList()
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [loadList, loadThread, router, selectedId])

  const waitingCount = useMemo(
    () => conversations.filter((item) => item.status === "waiting").length,
    [conversations]
  )

  async function runAction(action: "claim" | "close" | "return_to_bot") {
    if (!selectedId) return
    setBusy(true)
    try {
      const response = await fetch(`/api/admin/inbox/${selectedId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      })
      if (!response.ok) return
      await Promise.all([loadList(), loadThread(selectedId)])
    } finally {
      setBusy(false)
    }
  }

  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedId || !reply.trim()) return
    setBusy(true)
    try {
      const response = await fetch(`/api/admin/inbox/${selectedId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: reply.trim() }),
      })
      if (!response.ok) return
      setReply("")
      await Promise.all([loadList(), loadThread(selectedId)])
    } finally {
      setBusy(false)
    }
  }

  const composerEnabled =
    selected && selected.status !== "closed" && selected.status !== "bot"

  return (
    <div className="grid h-full min-h-0 flex-1 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm lg:grid-cols-[20rem_minmax(0,1fr)]">
      <div className="flex max-h-64 min-h-0 flex-col overflow-hidden border-b border-border/60 lg:max-h-none lg:border-r lg:border-b-0">
        <div className="flex shrink-0 flex-wrap gap-1 border-b border-border/60 bg-card p-3">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                filter === item.id
                  ? "bg-brand text-brand-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
              {item.id === "waiting" && waitingCount > 0
                ? ` ${waitingCount}`
                : ""}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {loadError ? (
            <p className="p-4 text-sm text-red-600 dark:text-red-400">
              {loadError}
            </p>
          ) : conversations.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              No chats in this filter yet.
            </p>
          ) : (
            conversations.map((item) => {
              const active = item.id === selectedId
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={cn(
                    "block w-full border-b border-border/50 px-4 py-3 text-left transition-colors",
                    active ? "bg-brand/10" : "hover:bg-muted/60"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {visitorLabel(item)}
                    </p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                        item.status === "waiting"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
                          : item.status === "human"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
                            : "bg-muted text-muted-foreground"
                      )}
                    >
                      {statusLabel(item.status)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {item.preview || "No messages yet"}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {formatTime(item.lastMessageAt)}
                  </p>
                </button>
              )
            })
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-col overflow-hidden">
        {!selected ? (
          <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
            Select a conversation.
          </div>
        ) : (
          <>
            <div className="shrink-0 border-b border-border/60 bg-card px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {visitorLabel(selected)}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selected.visitorEmail || "No email"} ·{" "}
                    {selected.visitorPhone || "No phone"} · From {selected.pagePath}
                  </p>
                  {selected.handoffReason ? (
                    <p className="mt-1 text-xs text-foreground/80">
                      Handoff: {selected.handoffReason}
                    </p>
                  ) : null}
                  {selected.assigneeName ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Claimed by {selected.assigneeName}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {selected.status === "waiting" || selected.status === "bot" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void runAction("claim")}
                      className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground disabled:opacity-50"
                    >
                      Claim
                    </button>
                  ) : null}
                  {selected.status !== "bot" && selected.status !== "closed" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void runAction("return_to_bot")}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                    >
                      Return to bot
                    </button>
                  ) : null}
                  {selected.status !== "closed" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void runAction("close")}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                    >
                      Close
                    </button>
                  ) : null}
                  <a
                    href={`${contactDetails.whatsappHref}?text=${encodeURIComponent(`Hi, following up from the website chat.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-muted/30 px-4 py-4">
              {messages
                .filter(
                  (message) =>
                    !message.content.startsWith(OFFER_HUMAN_HANDOFF)
                )
                .map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-start" : "justify-end",
                    message.role === "system" && "justify-center"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                      message.role === "user" &&
                        "rounded-tl-sm bg-background text-foreground shadow-sm",
                      message.role === "assistant" &&
                        "rounded-tr-sm bg-muted text-foreground",
                      message.role === "staff" &&
                        "rounded-tr-sm bg-brand text-brand-foreground",
                      message.role === "system" &&
                        "bg-transparent text-center text-xs text-muted-foreground"
                    )}
                  >
                    {message.role === "staff" ? (
                      <p className="mb-1 text-[10px] font-semibold uppercase opacity-80">
                        You
                      </p>
                    ) : message.role === "assistant" ? (
                      <p className="mb-1 text-[10px] font-semibold uppercase opacity-70">
                        Bot
                      </p>
                    ) : null}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="mt-1 text-[10px] opacity-60">
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={sendReply}
              className="shrink-0 border-t border-border/60 bg-card p-3"
            >
              {selected.status === "bot" ? (
                <p className="text-xs text-muted-foreground">
                  The assistant is still handling this chat. Claim it to reply
                  as a person.
                </p>
              ) : selected.status === "closed" ? (
                <p className="text-xs text-muted-foreground">This chat is closed.</p>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="Reply to the visitor…"
                    className="h-11 flex-1 rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-brand/30"
                  />
                  <button
                    type="submit"
                    disabled={busy || !reply.trim() || !composerEnabled}
                    className="rounded-xl bg-brand px-4 text-sm font-semibold text-brand-foreground disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  )
}
