"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

type ConditionalSiteShellProps = {
  top: ReactNode
  bottom: ReactNode
  children: ReactNode
}

export function ConditionalSiteShell({
  top,
  bottom,
  children,
}: ConditionalSiteShellProps) {
  const pathname = usePathname()
  const hideSiteChrome =
    pathname?.startsWith("/admin") || pathname?.startsWith("/pifattendance")

  if (hideSiteChrome) {
    return children
  }

  return (
    <>
      {top}
      {children}
      {bottom}
    </>
  )
}
