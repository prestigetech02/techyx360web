import Link from "next/link"

import type { AdminStatusFilter } from "@/lib/admin/pagination"
import { cn } from "@/lib/utils"

const DEFAULT_FILTERS: AdminStatusFilter[] = ["all", "new", "read", "replied"]

type AdminStatusFilterTabsProps = {
  active: string
  pathname: string
  query?: Record<string, string | undefined>
  filters?: readonly string[]
}

function buildFilterHref(
  pathname: string,
  status: string,
  query: Record<string, string | undefined> = {}
) {
  const params = new URLSearchParams()

  if (status !== "all") {
    params.set("status", status)
  }

  for (const [key, value] of Object.entries(query)) {
    if (key === "status" || key === "page" || !value) continue
    params.set(key, value)
  }

  const search = params.toString()
  return search ? `${pathname}?${search}` : pathname
}

export function AdminStatusFilterTabs({
  active,
  pathname,
  query = {},
  filters = DEFAULT_FILTERS,
}: AdminStatusFilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((status) => (
        <Link
          key={status}
          href={buildFilterHref(pathname, status, query)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors",
            active === status
              ? "bg-brand text-brand-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          {status}
        </Link>
      ))}
    </div>
  )
}
