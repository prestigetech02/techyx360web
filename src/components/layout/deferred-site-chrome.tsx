"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

const BackToTop = dynamic(
  () => import("@/components/layout/back-to-top").then((mod) => mod.BackToTop),
  { ssr: false }
)

const WhatsAppChatWidget = dynamic(
  () =>
    import("@/components/layout/whatsapp-chat-widget").then(
      (mod) => mod.WhatsAppChatWidget
    ),
  { ssr: false }
)

const CookieNotice = dynamic(
  () =>
    import("@/components/layout/cookie-notice").then((mod) => mod.CookieNotice),
  { ssr: false }
)

const CursorFollower = dynamic(
  () =>
    import("@/components/layout/cursor-follower").then(
      (mod) => mod.CursorFollower
    ),
  { ssr: false }
)

export function DeferredSiteChrome() {
  const [ready, setReady] = useState(false)
  const [loadCursor, setLoadCursor] = useState(false)

  useEffect(() => {
    let idleId = 0
    let timeoutId = 0
    let enabled = false

    const enable = () => {
      if (enabled) return
      enabled = true
      setReady(true)
      setLoadCursor(
        window.matchMedia("(hover: hover) and (pointer: fine)").matches
      )
    }

    timeoutId = window.setTimeout(enable, 2000)

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(enable, { timeout: 2000 })
    }

    window.addEventListener("pointerdown", enable, { once: true })
    window.addEventListener("keydown", enable, { once: true })
    window.addEventListener("scroll", enable, { once: true, passive: true })

    return () => {
      window.clearTimeout(timeoutId)
      if (idleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId)
      }
      window.removeEventListener("pointerdown", enable)
      window.removeEventListener("keydown", enable)
      window.removeEventListener("scroll", enable)
    }
  }, [])

  if (!ready) return null

  return (
    <>
      <BackToTop />
      <WhatsAppChatWidget />
      <CookieNotice />
      {loadCursor ? <CursorFollower /> : null}
    </>
  )
}
