"use client"

import Link from "next/link"
import { XIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

const STORAGE_KEY = "techyx360-cookie-notice-dismissed"

type CookieNoticeProps = {
  className?: string
}

export function CookieNotice({ className }: CookieNoticeProps) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setMounted(true)

    try {
      const dismissed = localStorage.getItem(STORAGE_KEY)
      if (!dismissed) {
        setVisible(true)
      }
    } catch {
      setVisible(true)
    }
  }, [])

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true")
    } catch {
      // Ignore storage errors and still hide the banner.
    }

    setVisible(false)
  }

  if (!mounted || !visible) return null

  return createPortal(
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie notice"
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-[9990] px-4 pb-4 sm:px-6 sm:pb-6",
        className
      )}
    >
      <div className="pointer-events-auto mx-auto flex max-w-5xl flex-col gap-4 rounded-xl border border-zinc-200/80 bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.18)] sm:p-5">
        <p className="text-sm leading-relaxed text-zinc-600 sm:text-[0.95rem]">
          This website uses cookies to ensure you get the best experience on our
          website.{" "}
          <Link
            href="/privacy-policy"
            className="font-semibold text-zinc-800 underline underline-offset-2 transition-colors hover:text-zinc-950"
          >
            More Details
          </Link>
        </p>

        <div className="flex shrink-0 items-center gap-3 self-start">
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-brand px-5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
          >
            Accept All
          </button>

          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss cookie notice"
            className="inline-flex size-10 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800"
          >
            <XIcon className="size-5" aria-hidden />
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
