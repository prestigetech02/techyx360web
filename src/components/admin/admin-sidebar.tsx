"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { useAdminNotifications } from "@/components/admin/admin-notifications-provider"
import { brand } from "@/config/brand"
import { adminNavItems } from "@/config/admin-nav"
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

export function AdminSidebar({ onNavigate, className }: AdminSidebarProps) {
  const pathname = usePathname()
  const { contactCount, registrationCount } = useAdminNotifications()

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      <div className="border-b border-sidebar-border px-5 py-5">
        <Link href="/admin" onClick={onNavigate} className="inline-flex">
          <Image
            src={brand.logo.light}
            alt={brand.name}
            width={180}
            height={44}
            className="h-9 w-auto dark:hidden"
          />
          <Image
            src={brand.logo.dark}
            alt={brand.name}
            width={180}
            height={44}
            className="hidden h-9 w-auto dark:block"
          />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {adminNavItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname === item.href || pathname.startsWith(`${item.href}/`)

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

      <div className="border-t border-sidebar-border px-5 py-4">
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
