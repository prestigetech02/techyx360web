"use client"

import { usePathname } from "next/navigation"

import { BackToTop } from "@/components/layout/back-to-top"
import { CookieNotice } from "@/components/layout/cookie-notice"
import { CursorFollower } from "@/components/layout/cursor-follower"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { TopBar } from "@/components/layout/top-bar"
import { WhatsAppChatWidget } from "@/components/layout/whatsapp-chat-widget"

type ConditionalSiteShellProps = {
  children: React.ReactNode
}

export function ConditionalSiteShell({ children }: ConditionalSiteShellProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith("/admin")

  if (isAdminRoute) {
    return <>{children}</>
  }

  return (
    <>
      <TopBar />
      <Header />
      {children}
      <Footer />
      <BackToTop />
      <WhatsAppChatWidget />
      <CookieNotice />
      <CursorFollower />
    </>
  )
}
