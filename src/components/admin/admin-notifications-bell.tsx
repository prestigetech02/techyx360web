"use client"

import Link from "next/link"
import { Bell } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import {
  AdminNotificationsList,
  useAdminNotifications,
} from "@/components/admin/admin-notifications-provider"
import { cn } from "@/lib/utils"

export function AdminNotificationsBell() {
  const { newCount } = useAdminNotifications()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={
          newCount > 0
            ? `Notifications, ${newCount} new submission${newCount === 1 ? "" : "s"}`
            : "Notifications"
        }
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className="relative inline-flex size-10 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Bell className="size-5" aria-hidden />
        {newCount > 0 ? (
          <span className="absolute -top-1.5 -right-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-foreground">
            {newCount > 99 ? "99+" : newCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border border-border/60 bg-popover text-popover-foreground shadow-lg"
        >
          <div className="border-b border-border/60 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            <p className="text-xs text-muted-foreground">
              {newCount > 0
                ? `${newCount} new submission${newCount === 1 ? "" : "s"}`
                : "You're all caught up"}
            </p>
          </div>

          <AdminNotificationsList onNavigate={() => setOpen(false)} />

          <div className="border-t border-border/60 px-4 py-3">
            <Link
              href="/admin/contact"
              onClick={() => setOpen(false)}
              className={cn(
                "inline-flex text-sm font-medium text-brand transition-colors hover:text-[#eaaa33]"
              )}
            >
              View all in Contact
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
