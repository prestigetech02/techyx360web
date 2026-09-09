"use client"

import Image from "next/image"
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { DefaultChatTransport } from "ai"
import { useChat } from "@ai-sdk/react"
import { MessageCircle, Minus, SendHorizontal, XIcon } from "lucide-react"

import { WhatsAppIcon } from "@/components/icons/contact-icons"
import { brand } from "@/config/brand"
import { contactDetails } from "@/config/contact"
import { OFFER_HUMAN_HANDOFF, type ChatConversationView, type ChatMessageView } from "@/lib/chat/types"
import { cn } from "@/lib/utils"

const WELCOME_MESSAGE =
  "Welcome to Techyx360 — how can we help today? Ask about training, services, or SIWES."

const VISITOR_TOKEN_KEY = "techyx360.chat.visitor"

function getVisitorToken() {
  if (typeof window === "undefined") return ""
  const existing = window.localStorage.getItem(VISITOR_TOKEN_KEY)
  if (existing && /^[a-f0-9]{32,128}$/i.test(existing)) return existing
  const bytes = new Uint8Array(32)
  window.crypto.getRandomValues(bytes)
  const token = Array.from(bytes, (value) =>
    value.toString(16).padStart(2, "0")
  ).join("")
  window.localStorage.setItem(VISITOR_TOKEN_KEY, token)
  return token
}

function visitorHeaders(token: string): Record<string, string> {
  return { "x-visitor-token": token, "content-type": "application/json" }
}

function messageText(parts: Array<{ type: string; text?: string }> | undefined) {
  if (!parts) return ""
  return parts
    .filter((part) => part.type === "text" && part.text)
    .map((part) => part.text ?? "")
    .join("")
}

function buildWhatsAppUrl(message: string) {
  const text = message.trim() || "Hi Techyx360, I was chatting on the website."
  return `${contactDetails.whatsappHref}?text=${encodeURIComponent(text)}`
}

function statusLabel(status: ChatConversationView["status"] | null) {
  if (status === "waiting") return "Waiting for a teammate"
  if (status === "human") return "A teammate is chatting"
  if (status === "closed") return "This chat is closed"
  return "Usually replies instantly"
}

function isHandoffToolPart(part: { type?: string }) {
  return part.type === "tool-offerTalkToPerson"
}

export function SiteChatWidget() {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [token] = useState(getVisitorToken)
  const [conversation, setConversation] = useState<ChatConversationView | null>(
    null
  )
  const [thread, setThread] = useState<ChatMessageView[]>([])
  const [handoffBusy, setHandoffBusy] = useState(false)
  const [confirmEnd, setConfirmEnd] = useState(false)
  const [ending, setEnding] = useState(false)
  const [notice, setNotice] = useState("")
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: visitorHeaders(token),
        prepareSendMessagesRequest: ({ messages, headers, credentials, api }) => {
          const last = messages[messages.length - 1]
          const text = messageText(
            last?.parts as Array<{ type: string; text?: string }> | undefined
          )
          return {
            api,
            credentials,
            headers,
            body: {
              text,
              pagePath:
                typeof window !== "undefined" ? window.location.pathname : "/",
            },
          }
        },
      }),
    [token]
  )

  const loadSessionRef = useRef<() => Promise<void>>(async () => {})

  const {
    messages,
    sendMessage,
    setMessages,
    status: streamStatus,
    error,
  } = useChat({
    transport,
    onFinish: () => {
      void loadSessionRef.current()
    },
    onError: () => {
      void loadSessionRef.current()
    },
  })

  const conversationStatus = conversation?.status ?? "bot"
  const isHumanThread =
    conversationStatus === "waiting" || conversationStatus === "human"
  const streaming = streamStatus === "submitted" || streamStatus === "streaming"

  const loadSession = useCallback(async () => {
    if (!token) return
    const response = await fetch("/api/chat/session", {
      headers: visitorHeaders(token),
    })
    if (!response.ok) return
    const payload = (await response.json()) as {
      conversation: ChatConversationView | null
      messages: ChatMessageView[]
      uiMessages: typeof messages
    }
    setConversation(payload.conversation)
    setThread(payload.messages ?? [])
    if (payload.uiMessages?.length) {
      setMessages(payload.uiMessages)
    }
  }, [setMessages, token])

  loadSessionRef.current = loadSession

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !token) return
    void loadSession()
  }, [loadSession, mounted, token])

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => inputRef.current?.focus(), 150)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages, thread, streaming, open])

  useEffect(() => {
    if (!open || !isHumanThread) return
    const timer = window.setInterval(() => {
      void loadSession()
    }, 4000)
    return () => window.clearInterval(timer)
  }, [isHumanThread, loadSession, open])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = input.trim()
    if (!text || streaming) return
    setInput("")
    setNotice("")

    if (isHumanThread) {
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: visitorHeaders(token),
        body: JSON.stringify({
          text,
          pagePath: window.location.pathname,
        }),
      })
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string
        } | null
        setNotice(payload?.error || "Could not send that message.")
        setInput(text)
        return
      }
      await loadSession()
      return
    }

    try {
      await sendMessage({ text })
    } catch {
      setNotice("Could not send that message.")
      setInput(text)
      await loadSession()
    }
  }

  async function handleHandoff() {
    setHandoffBusy(true)
    setNotice("")
    try {
      const response = await fetch("/api/chat/handoff", {
        method: "POST",
        headers: visitorHeaders(token),
        body: JSON.stringify({
          reason: "Visitor tapped Talk to a person.",
          pagePath: window.location.pathname,
        }),
      })
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string
        } | null
        setNotice(payload?.error || "Could not reach a teammate.")
        return
      }
      await loadSession()
    } finally {
      setHandoffBusy(false)
    }
  }

  async function handleEndSession() {
    setEnding(true)
    setNotice("")
    try {
      const response = await fetch("/api/chat/session", {
        method: "POST",
        headers: visitorHeaders(token),
        body: JSON.stringify({
          action: "end",
          pagePath: window.location.pathname,
        }),
      })
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string
        } | null
        setNotice(payload?.error || "Could not end this chat.")
        return
      }
      setMessages([])
      setThread([])
      setConversation(null)
      setConfirmEnd(false)
      setOpen(false)
    } finally {
      setEnding(false)
    }
  }

  const visibleMessages = isHumanThread
    ? thread.filter((item) => item.role !== "system")
    : messages

  const handoffOffered =
    conversationStatus === "bot" &&
    (thread.some(
      (item) =>
        item.role === "system" && item.content.startsWith(OFFER_HUMAN_HANDOFF)
    ) ||
      messages.some((item) =>
        item.parts?.some((part) => isHandoffToolPart(part))
      ))

  if (!mounted) return null

  return createPortal(
    <div className="pointer-events-none fixed right-5 bottom-5 z-[9995] flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      {open ? (
        <div
          role="dialog"
          aria-label="Techyx360 live chat"
          className="pointer-events-auto relative flex h-[min(32rem,calc(100dvh-6.5rem))] w-[min(100vw-2.5rem,22.5rem)] flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_18px_50px_rgba(15,23,42,0.28)]"
        >
          <div className="flex items-center gap-3 bg-brand px-4 py-3 text-brand-foreground">
            <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-white/15 ring-2 ring-white/20">
              <Image
                src={brand.logo.dark}
                alt=""
                fill
                className="object-contain p-1.5"
                sizes="40px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{brand.name}</p>
              <p className="text-xs text-white/75">
                {statusLabel(conversation?.status ?? null)}
              </p>
            </div>
            <a
              href={buildWhatsAppUrl(input)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Continue on WhatsApp"
              className="inline-flex size-8 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/10 hover:text-white"
            >
              <WhatsAppIcon className="size-4" />
            </a>
            <button
              type="button"
              aria-label="Minimize chat"
              onClick={() => {
                setConfirmEnd(false)
                setOpen(false)
              }}
              className="inline-flex size-8 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Minus className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Close chat session"
              onClick={() => setConfirmEnd(true)}
              className="inline-flex size-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <XIcon className="size-4" aria-hidden />
            </button>
          </div>

          <div
            ref={listRef}
            className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-muted/40 px-4 py-4"
          >
            <ChatBubble role="assistant">{WELCOME_MESSAGE}</ChatBubble>
            {visibleMessages.map((item) => {
              if ("role" in item && "content" in item) {
                const message = item as ChatMessageView
                if (!message.content.trim()) return null
                return (
                  <ChatBubble key={message.id} role={message.role}>
                    {message.content}
                  </ChatBubble>
                )
              }
              const ui = item as (typeof messages)[number]
              const text = messageText(
                ui.parts as Array<{ type: string; text?: string }>
              )
              if (!text.trim()) return null
              return (
                <ChatBubble
                  key={ui.id}
                  role={ui.role === "user" ? "user" : "assistant"}
                >
                  {text}
                </ChatBubble>
              )
            })}
            {handoffOffered ? (
              <TalkToPersonButton
                disabled={handoffBusy}
                onClick={() => void handleHandoff()}
              />
            ) : null}
            {streaming ? (
              <p className="text-xs text-muted-foreground">Typing…</p>
            ) : null}
            {notice || error?.message ? (
              <p className="text-xs text-red-600 dark:text-red-400">
                {notice || error?.message}
              </p>
            ) : null}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-border/60 bg-card px-3 py-3"
          >
            <label htmlFor="site-chat-input" className="sr-only">
              Type your message
            </label>
            <input
              id="site-chat-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                conversationStatus === "closed"
                  ? "Start a new chat to continue"
                  : "Type a message..."
              }
              disabled={conversationStatus === "closed"}
              className="h-11 flex-1 rounded-full border border-border/70 bg-background px-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-brand/30"
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={!input.trim() || streaming || conversationStatus === "closed"}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SendHorizontal className="size-5" aria-hidden />
            </button>
          </form>

          {confirmEnd ? (
            <div className="absolute inset-0 z-10 flex items-end bg-black/40 p-4 sm:items-center">
              <div
                role="alertdialog"
                aria-labelledby="end-chat-title"
                aria-describedby="end-chat-copy"
                className="w-full rounded-2xl bg-card p-4 shadow-lg"
              >
                <p
                  id="end-chat-title"
                  className="text-sm font-semibold text-foreground"
                >
                  End this chat?
                </p>
                <p
                  id="end-chat-copy"
                  className="mt-1 text-sm text-muted-foreground"
                >
                  This conversation will be closed. You can start a new chat
                  afterwards.
                </p>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmEnd(false)}
                    disabled={ending}
                    className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    Keep chatting
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleEndSession()}
                    disabled={ending}
                    className="rounded-full bg-brand px-3 py-1.5 text-sm font-semibold text-brand-foreground disabled:opacity-50"
                  >
                    {ending ? "Ending…" : "End chat"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Minimize chat" : "Open live chat"}
        onClick={() => {
          setConfirmEnd(false)
          setOpen((current) => !current)
        }}
        className={cn(
          "pointer-events-auto inline-flex size-14 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-lg shadow-black/25 transition-transform hover:scale-105 hover:opacity-95 active:scale-95"
        )}
      >
        {open ? (
          <Minus className="size-6" aria-hidden />
        ) : (
          <MessageCircle className="size-7" aria-hidden />
        )}
      </button>
    </div>,
    document.body
  )
}

function TalkToPersonButton({
  disabled,
  onClick,
}: {
  disabled: boolean
  onClick: () => void
}) {
  return (
    <div className="flex justify-start">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Talk to a person
      </button>
    </div>
  )
}

function ChatBubble({
  role,
  children,
}: {
  role: "user" | "assistant" | "staff" | "system"
  children: string
}) {
  const isUser = role === "user"
  const isStaff = role === "staff"
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
          isUser
            ? "rounded-br-sm bg-brand text-brand-foreground"
            : isStaff
              ? "rounded-tl-sm bg-foreground text-background"
              : "rounded-tl-sm bg-background text-foreground"
        )}
      >
        {isStaff ? (
          <p className="mb-1 text-[10px] font-semibold tracking-wide uppercase opacity-70">
            Team
          </p>
        ) : null}
        <p className="whitespace-pre-wrap">{children}</p>
      </div>
    </div>
  )
}
