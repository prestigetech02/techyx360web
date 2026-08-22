import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { AdminPaginationMeta } from "@/lib/admin/pagination"
import { cn } from "@/lib/utils"

type AdminTablePaginationProps = {
  pagination: AdminPaginationMeta
  pathname: string
  query?: Record<string, string | undefined>
  className?: string
}

function buildPageHref(
  pathname: string,
  page: number,
  query: Record<string, string | undefined> = {}
) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value)
  }

  if (page > 1) {
    params.set("page", String(page))
  }

  const search = params.toString()
  return search ? `${pathname}?${search}` : pathname
}

export function AdminTablePagination({
  pagination,
  pathname,
  query = {},
  className,
}: AdminTablePaginationProps) {
  const { page, pageSize, total, totalPages } = pagination

  if (total === 0) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6",
        className
      )}
    >
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">
          {from.toLocaleString()}–{to.toLocaleString()}
        </span>{" "}
        of{" "}
        <span className="font-medium text-foreground">
          {total.toLocaleString()}
        </span>
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          className="rounded-lg"
          render={
            page > 1 ? (
              <Link
                href={buildPageHref(pathname, page - 1, query)}
                aria-label="Previous page"
              />
            ) : undefined
          }
        >
          <ChevronLeft className="size-4" aria-hidden />
          Previous
        </Button>

        <span className="min-w-[7rem] text-center text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          className="rounded-lg"
          render={
            page < totalPages ? (
              <Link
                href={buildPageHref(pathname, page + 1, query)}
                aria-label="Next page"
              />
            ) : undefined
          }
        >
          Next
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  )
}
