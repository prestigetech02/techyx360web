import Image from "next/image"
import Link from "next/link"

import type { BlogPost } from "@/config/blog"
import {
  buildBlogListHref,
  formatArchiveLabel,
  getBlogArchiveEntries,
  getBlogTagEntries,
  sortBlogPostsNewestFirst,
} from "@/lib/blog/listing"
import { cn } from "@/lib/utils"

function formatRecentDate(iso: string) {
  const date = new Date(iso)
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

type BlogSidebarProps = {
  posts: BlogPost[]
  activeMonth?: string
  activeTag?: string
  className?: string
}

export function BlogSidebar({
  posts,
  activeMonth,
  activeTag,
  className,
}: BlogSidebarProps) {
  const recentPosts = sortBlogPostsNewestFirst(posts).slice(0, 5)
  const archiveList = getBlogArchiveEntries(posts)
  const tags = getBlogTagEntries(posts)
  const maxCount = tags[0]?.[1] ?? 1
  const hasActiveFilters = Boolean(activeMonth || activeTag)

  return (
    <aside
      className={cn(
        "flex flex-col gap-8 lg:sticky lg:top-24 lg:self-start",
        className
      )}
    >
      {hasActiveFilters ? (
        <section className="order-0 rounded-2xl border border-brand/20 bg-brand/5 p-4 lg:order-1">
          <p className="text-sm font-medium text-foreground">Active filters</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {activeMonth ? (
              <span className="inline-flex items-center rounded-full border border-brand/30 bg-background px-3 py-1 text-xs font-medium text-brand">
                {formatArchiveLabel(activeMonth)}
              </span>
            ) : null}
            {activeTag ? (
              <span className="inline-flex items-center rounded-full border border-brand/30 bg-background px-3 py-1 text-xs font-medium text-brand">
                {activeTag}
              </span>
            ) : null}
          </div>
          <Link
            href="/blog"
            className="mt-3 inline-flex text-sm font-medium text-brand transition-colors hover:text-[#eaaa33]"
          >
            Clear filters
          </Link>
        </section>
      ) : null}

      <section className="order-1 lg:order-4">
        <h3 className="text-base font-semibold text-foreground">Recents</h3>
        <ul className="mt-4 space-y-3">
          {recentPosts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="flex gap-3 rounded-2xl border border-border/60 bg-card/30 p-3 transition-colors hover:border-brand/30 hover:bg-brand/5 sm:gap-4 sm:p-4"
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl sm:size-20">
                  <Image
                    src={post.featuredImage}
                    alt={post.featuredImageAlt}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-sm font-semibold text-foreground transition-colors hover:text-brand">
                    {post.title}
                  </div>
                  <div className="mt-1.5 text-xs text-muted-foreground">
                    {formatRecentDate(post.dateISO)} · {post.readTimeMins} min
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="order-2 lg:order-2">
        <h3 className="text-base font-semibold text-foreground">Archives</h3>
        <ul className="mt-4 space-y-2">
          {archiveList.map(({ monthKey, label, count }) => {
            const isActive = activeMonth === monthKey

            return (
              <li key={monthKey}>
                <Link
                  href={buildBlogListHref({ month: monthKey })}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "border-brand/40 bg-brand/10 text-brand"
                      : "border-border/60 bg-card/30 text-muted-foreground hover:border-brand/30 hover:bg-brand/5 hover:text-brand"
                  )}
                >
                  <span>{label}</span>
                  <span className={isActive ? "text-brand" : "text-foreground/70"}>
                    ({count})
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="order-3 lg:order-3">
        <h3 className="text-base font-semibold text-foreground">Tag Cloud</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map(([tag, count]) => {
            const pct = count / maxCount
            const size =
              pct > 0.85 ? "text-sm" : pct > 0.6 ? "text-[0.95rem]" : "text-[0.9rem]"
            const isActive = activeTag?.toLowerCase() === tag.toLowerCase()

            return (
              <Link
                key={tag}
                href={buildBlogListHref({ tag })}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 transition-colors",
                  size,
                  isActive
                    ? "border-brand/40 bg-brand/10 text-brand"
                    : "border-border/60 bg-card/30 text-muted-foreground hover:border-brand/40 hover:bg-brand/10 hover:text-brand"
                )}
              >
                {tag}
              </Link>
            )
          })}
        </div>
      </section>
    </aside>
  )
}
