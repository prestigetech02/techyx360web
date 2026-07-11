"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"

import { useAdminNotifications } from "@/components/admin/admin-notifications-provider"
import { brand } from "@/config/brand"
import {
  adminNavItems,
  pifApplicationsAdminPath,
  type AdminNavItem,
} from "@/config/admin-nav"
import { cn } from "@/lib/utils"

type AdminSidebarProps = {
  onNavigate?: () => void
  className?: string
}

function NavCountBadge({ count }: { count: number }) {
  if (count <= 0) return null

  return (
    <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-brand-foreground">
      {count > 99 ? "99+" : count}
    </span>
  )
}

function AdminNavGroup({
  item,
  pathname,
  onNavigate,
  pifCount,
}: {
  item: AdminNavItem
  pathname: string
  onNavigate?: () => void
  pifCount: number
}) {
  const isChildActive = item.children?.some(
    (child) =>
      pathname === child.href || pathname.startsWith(`${child.href}/`)
  )
  const [isOpen, setIsOpen] = useState(Boolean(isChildActive))

  useEffect(() => {
    if (isChildActive) {
      setIsOpen(true)
    }
  }, [isChildActive])

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
          isChildActive
            ? "bg-brand/10 text-brand"
            : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        <item.icon className="size-5 shrink-0" aria-hidden />
        <span className="flex-1 text-left">{item.label}</span>
        {pifCount > 0 ? <NavCountBadge count={pifCount} /> : null}
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform",
            isOpen ? "rotate-180" : "rotate-0"
          )}
          aria-hidden
        />
      </button>

      {isOpen ? (
        <div className="space-y-1 pl-4">
          {item.children?.map((child) => {
            const isActive =
              pathname === child.href ||
              pathname.startsWith(`${child.href}/`)

            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand/10 text-brand"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <span className="size-1.5 shrink-0 rounded-full bg-current opacity-60" />
                <span className="flex-1">{child.label}</span>
                {child.href === pifApplicationsAdminPath ? (
                  <NavCountBadge count={pifCount} />
                ) : null}
              </Link>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export function AdminSidebar({ onNavigate, className }: AdminSidebarProps) {
  const pathname = usePathname()
  const { contactCount, registrationCount, pifCount } = useAdminNotifications()

  return (
    <aside
      className={cn(
        "flex h-full max-h-dvh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      <div className="shrink-0 border-b border-sidebar-border px-4 py-3">
        <Link href="/admin" onClick={onNavigate} className="inline-flex">
          <Image
            src={brand.logo.light}
            alt={brand.name}
            width={180}
            height={44}
            className="h-8 w-auto dark:hidden"
          />
          <Image
            src={brand.logo.dark}
            alt={brand.name}
            width={180}
            height={44}
            className="hidden h-8 w-auto dark:block"
          />
        </Link>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-3">
        {adminNavItems.map((item) => {
          if (item.children?.length) {
            return (
              <AdminNavGroup
                key={item.label}
                item={item}
                pathname={pathname}
                onNavigate={onNavigate}
                pifCount={pifCount}
              />
            )
          }

          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href!}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand/10 text-brand"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="size-5 shrink-0" aria-hidden />
              <span className="flex-1">{item.label}</span>
              {item.href === "/admin/registrations" ? (
                <NavCountBadge count={registrationCount} />
              ) : null}
              {item.href === "/admin/contact" ? (
                <NavCountBadge count={contactCount} />
              ) : null}
            </Link>
          )
        })}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border px-4 py-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-brand"
        >
          Back to website
        </Link>
      </div>
    </aside>
  )
}
