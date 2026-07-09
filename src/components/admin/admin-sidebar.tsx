"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { brand } from "@/config/brand"
import { adminNavItems } from "@/config/admin-nav"
import { cn } from "@/lib/utils"

type AdminSidebarProps = {
  onNavigate?: () => void
  className?: string
}

export function AdminSidebar({ onNavigate, className }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-border/60 bg-white",
        className
      )}
    >
      <div className="border-b border-border/60 px-5 py-5">
        <Link href="/admin" onClick={onNavigate} className="inline-flex">
          <Image
            src={brand.logo.light}
            alt={brand.name}
            width={180}
            height={44}
            className="h-9 w-auto"
          />
        </Link>
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          Admin Dashboard
        </p>
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
                  : "text-zinc-600 hover:bg-muted hover:text-zinc-900"
              )}
            >
              <item.icon className="size-5 shrink-0" aria-hidden />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border/60 px-5 py-4">
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
