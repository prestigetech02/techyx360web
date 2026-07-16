"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { useAdminNotifications } from "@/components/admin/admin-notifications-provider"
import { brand } from "@/config/brand"
import {
  adminNavItems,
  type AdminNavBadgeKey,
  type AdminNavChildItem,
  type AdminNavItem,
  type AdminNavLeafItem,
} from "@/config/admin-nav"
import { cn } from "@/lib/utils"

type AdminSidebarProps = {
  onNavigate?: () => void
  className?: string
}

type BadgeCounts = Record<AdminNavBadgeKey, number>

function NavCountBadge({ count }: { count: number }) {
  if (count <= 0) return null

  return (
    <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-brand-foreground">
      {count > 99 ? "99+" : count}
    </span>
  )
}

function SoonBadge() {
  return (
    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
      Soon
    </span>
  )
}

function isPathActive(pathname: string, href?: string) {
  if (!href) return false
  if (href === "/admin") return pathname === "/admin"
  return pathname === href || pathname.startsWith(`${href}/`)
}

function leafHasActivePath(pathname: string, item: AdminNavLeafItem): boolean {
  if (isPathActive(pathname, item.href)) return true
  return false
}

function childHasActivePath(
  pathname: string,
  item: AdminNavChildItem
): boolean {
  if (leafHasActivePath(pathname, item)) return true
  return Boolean(item.children?.some((child) => leafHasActivePath(pathname, child)))
}

function groupHasActivePath(pathname: string, item: AdminNavItem): boolean {
  if (isPathActive(pathname, item.href)) return true
  return Boolean(item.children?.some((child) => childHasActivePath(pathname, child)))
}

function getBadgeCount(
  badgeKey: AdminNavBadgeKey | undefined,
  counts: BadgeCounts
) {
  if (!badgeKey) return 0
  return counts[badgeKey] ?? 0
}

function sumChildBadges(
  children: AdminNavChildItem[] | undefined,
  counts: BadgeCounts
) {
  if (!children?.length) return 0

  return children.reduce((total, child) => {
    let sum = total + getBadgeCount(child.badgeKey, counts)
    if (child.children?.length) {
      sum += child.children.reduce(
        (nested, leaf) => nested + getBadgeCount(leaf.badgeKey, counts),
        0
      )
    }
    return sum
  }, 0)
}

function NavLeafLink({
  item,
  pathname,
  onNavigate,
  counts,
  nested = false,
}: {
  item: AdminNavLeafItem
  pathname: string
  onNavigate?: () => void
  counts: BadgeCounts
  nested?: boolean
}) {
  const badgeCount = getBadgeCount(item.badgeKey, counts)

  if (item.comingSoon || !item.href) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground/60",
          nested && "pl-3"
        )}
        aria-disabled="true"
      >
        <span className="size-1.5 shrink-0 rounded-full bg-current opacity-40" />
        <span className="flex-1 truncate">{item.label}</span>
        <SoonBadge />
      </div>
    )
  }

  const isActive = isPathActive(pathname, item.href)

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        nested && "pl-3",
        isActive
          ? "bg-brand/10 text-brand"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-current opacity-60" />
      <span className="flex-1 truncate">{item.label}</span>
      <NavCountBadge count={badgeCount} />
    </Link>
  )
}

function NestedNavGroup({
  item,
  pathname,
  onNavigate,
  counts,
}: {
  item: AdminNavChildItem
  pathname: string
  onNavigate?: () => void
  counts: BadgeCounts
}) {
  const isChildActive = Boolean(
    item.children?.some((child) => leafHasActivePath(pathname, child))
  )
  const [isOpen, setIsOpen] = useState(isChildActive)
  const nestedBadgeCount = (item.children ?? []).reduce(
    (total, child) => total + getBadgeCount(child.badgeKey, counts),
    0
  )

  useEffect(() => {
    if (isChildActive) setIsOpen(true)
  }, [isChildActive])

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
          isChildActive
            ? "bg-brand/10 text-brand"
            : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        <span className="size-1.5 shrink-0 rounded-full bg-current opacity-60" />
        <span className="flex-1 truncate text-left">{item.label}</span>
        <NavCountBadge count={nestedBadgeCount} />
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 transition-transform",
            isOpen ? "rotate-180" : "rotate-0"
          )}
          aria-hidden
        />
      </button>

      {isOpen ? (
        <div className="ml-3 space-y-1 border-l border-sidebar-border/80 pl-2">
          {item.children?.map((child) => (
            <NavLeafLink
              key={child.href ?? child.label}
              item={child}
              pathname={pathname}
              onNavigate={onNavigate}
              counts={counts}
              nested
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function AdminNavGroup({
  item,
  pathname,
  onNavigate,
  counts,
}: {
  item: AdminNavItem
  pathname: string
  onNavigate?: () => void
  counts: BadgeCounts
}) {
  const isChildActive = groupHasActivePath(pathname, item)
  const [isOpen, setIsOpen] = useState(isChildActive)
  const groupBadgeCount = sumChildBadges(item.children, counts)

  useEffect(() => {
    if (isChildActive) setIsOpen(true)
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
        <span className="flex-1 truncate text-left">{item.label}</span>
        <NavCountBadge count={groupBadgeCount} />
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
            if (child.children?.length) {
              return (
                <NestedNavGroup
                  key={child.label}
                  item={child}
                  pathname={pathname}
                  onNavigate={onNavigate}
                  counts={counts}
                />
              )
            }

            return (
              <NavLeafLink
                key={child.href ?? child.label}
                item={child}
                pathname={pathname}
                onNavigate={onNavigate}
                counts={counts}
              />
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export function AdminSidebar({ onNavigate, className }: AdminSidebarProps) {
  const pathname = usePathname()
  const { contactCount, registrationCount, pifCount, careerCount } =
    useAdminNotifications()

  const counts = useMemo<BadgeCounts>(
    () => ({
      contact: contactCount,
      registration: registrationCount,
      pif: pifCount,
      career: careerCount,
    }),
    [contactCount, registrationCount, pifCount, careerCount]
  )

  return (
    <aside
      className={cn(
        "flex h-full max-h-dvh w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
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
                counts={counts}
              />
            )
          }

          if (item.comingSoon || !item.href) {
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground/60"
                aria-disabled="true"
              >
                <item.icon className="size-5 shrink-0" aria-hidden />
                <span className="flex-1 truncate">{item.label}</span>
                <SoonBadge />
              </div>
            )
          }

          const isActive = isPathActive(pathname, item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand/10 text-brand"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="size-5 shrink-0" aria-hidden />
              <span className="flex-1 truncate">{item.label}</span>
              <NavCountBadge count={getBadgeCount(item.badgeKey, counts)} />
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
