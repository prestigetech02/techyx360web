import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { buildBlogListHref } from "@/lib/blog/listing"
import { cn } from "@/lib/utils"

type BlogPaginationProps = {
  currentPage: number
  totalPages: number
  month?: string
  tag?: string
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, totalPages, currentPage])

  if (currentPage > 1) pages.add(currentPage - 1)
  if (currentPage < totalPages) pages.add(currentPage + 1)

  return [...pages].sort((left, right) => left - right)
}

export function BlogPagination({
  currentPage,
  totalPages,
  month,
  tag,
}: BlogPaginationProps) {
  if (totalPages <= 1) return null

  const pages = getVisiblePages(currentPage, totalPages)

  return (
    <nav
      aria-label="Blog pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      <Link
        href={buildBlogListHref({
          month,
          tag,
          page: Math.max(currentPage - 1, 1),
        })}
        aria-disabled={currentPage === 1}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-10 rounded-xl px-4",
          currentPage === 1 && "pointer-events-none opacity-50"
        )}
      >
        Previous
      </Link>

      <div className="flex flex-wrap items-center gap-1.5">
        {pages.map((page, index) => {
          const previousPage = pages[index - 1]
          const showEllipsis = previousPage && page - previousPage > 1

          return (
            <span key={page} className="flex items-center gap-1.5">
              {showEllipsis ? (
                <span className="px-1 text-sm text-muted-foreground">…</span>
              ) : null}
              <Link
                href={buildBlogListHref({ month, tag, page })}
                aria-current={page === currentPage ? "page" : undefined}
                className={cn(
                  buttonVariants({
                    variant: page === currentPage ? "default" : "outline",
                  }),
                  "h-10 min-w-10 rounded-xl px-3",
                  page === currentPage &&
                    "bg-brand text-brand-foreground hover:bg-brand/90"
                )}
              >
                {page}
              </Link>
            </span>
          )
        })}
      </div>

      <Link
        href={buildBlogListHref({
          month,
          tag,
          page: Math.min(currentPage + 1, totalPages),
        })}
        aria-disabled={currentPage === totalPages}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-10 rounded-xl px-4",
          currentPage === totalPages && "pointer-events-none opacity-50"
        )}
      >
        Next
      </Link>
    </nav>
  )
}
