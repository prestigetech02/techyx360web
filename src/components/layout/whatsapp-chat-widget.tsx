"use client"

import Image from "next/image"
import { FormEvent, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { SendHorizontal, XIcon } from "lucide-react"

import { WhatsAppIcon } from "@/components/icons/contact-icons"
import { brand } from "@/config/brand"
import { contactDetails } from "@/config/contact"
import { cn } from "@/lib/utils"

const WELCOME_MESSAGE =
  "Welcome to TechyX360, how may we be of help today?"

function buildWhatsAppUrl(message: string) {
  const text = message.trim()
  const encoded = encodeURIComponent(text)
  return `${contactDetails.whatsappHref}?text=${encoded}`
}

export function WhatsAppChatWidget() {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 150)
      return () => window.clearTimeout(timer)
    }
  }, [open])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const text = message.trim()
    if (!text) return

    window.open(buildWhatsAppUrl(text), "_blank", "noopener,noreferrer")
    setMessage("")
    setOpen(false)
  }

  if (!mounted) return null

  return createPortal(
    <div className="pointer-events-none fixed bottom-5 left-5 z-[9995] flex flex-col items-start gap-3 sm:bottom-6 sm:left-6">
      {open ? (
        <div
          role="dialog"
          aria-label="WhatsApp live chat"
          className="pointer-events-auto w-[min(100vw-2.5rem,22rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#0b141a] shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
        >
          <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3 text-white">
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
              <p className="text-xs text-white/75">Usually replies instantly</p>
            </div>
            <button
              type="button"
              aria-label="Close WhatsApp chat"
              onClick={() => setOpen(false)}
              className="inline-flex size-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <XIcon className="size-4" aria-hidden />
            </button>
          </div>

          <div className="relative min-h-[220px] bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22 viewBox=%220 0 120 120%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M0 60h120M60 0v120%22/%3E%3C/g%3E%3C/svg%3E')] bg-[#0b141a] px-4 py-4">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#202c33] px-3.5 py-2.5 text-sm leading-relaxed text-[#e9edef] shadow-sm">
              {WELCOME_MESSAGE}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-white/5 bg-[#202c33] px-3 py-3"
          >
            <label htmlFor="whatsapp-chat-input" className="sr-only">
              Type your message
            </label>
            <input
              id="whatsapp-chat-input"
              ref={inputRef}
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Type a message..."
              className="h-11 flex-1 rounded-full border-0 bg-[#2a3942] px-4 text-sm text-[#e9edef] outline-none placeholder:text-[#8696a0] focus:ring-2 focus:ring-[#25d366]/40"
            />
            <button
              type="submit"
              aria-label="Send message on WhatsApp"
              disabled={!message.trim()}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[#25d366] text-white transition-colors hover:bg-[#1ebe57] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SendHorizontal className="size-5" aria-hidden />
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close WhatsApp chat" : "Open WhatsApp live chat"}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "pointer-events-auto inline-flex size-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg shadow-black/30 transition-transform hover:scale-105 hover:bg-[#1ebe57] active:scale-95",
          open && "rotate-0"
        )}
      >
        {open ? (
          <XIcon className="size-6" aria-hidden />
        ) : (
          <WhatsAppIcon className="size-7" />
        )}
      </button>
    </div>,
    document.body
  )
}
