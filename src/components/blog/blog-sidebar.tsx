import Link from "next/link"

import type { BlogPost } from "@/config/blog"
import { cn } from "@/lib/utils"

function monthLabel(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long" })
}

export function BlogSidebar({
  posts,
}: {
  posts: BlogPost[]
}) {
  const recents = [...posts].sort(
    (a, b) => +new Date(b.dateISO) - +new Date(a.dateISO)
  )
  const recentPosts = recents.slice(0, 5)

  const archiveMap = new Map<string, number>()
  posts.forEach((p) => {
    const key = monthLabel(p.dateISO)
    archiveMap.set(key, (archiveMap.get(key) ?? 0) + 1)
  })

  const archiveList = [...archiveMap.entries()].sort((a, b) => {
    const ad = new Date(a[0]).getTime()
    const bd = new Date(b[0]).getTime()
    return bd - ad
  })

  const tagCount = new Map<string, number>()
  posts.forEach((p) =>
    p.tags.forEach((t) => tagCount.set(t, (tagCount.get(t) ?? 0) + 1))
  )
  const tags = [...tagCount.entries()].sort((a, b) => b[1] - a[1])

  const maxCount = tags[0]?.[1] ?? 1

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="space-y-8">
        <section>
          <h3 className="text-base font-semibold text-foreground">Archives</h3>
          <ul className="mt-4 space-y-2">
            {archiveList.map(([label, count]) => (
              <li key={label}>
                <Link
                  href="/blog"
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-card/30 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-brand/30 hover:bg-brand/5 hover:text-brand"
                >
                  <span>{label}</span>
                  <span className="text-foreground/70">({count})</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-base font-semibold text-foreground">Tag Cloud</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map(([tag, count]) => {
              const pct = count / maxCount
              const size =
                pct > 0.85 ? "text-sm" : pct > 0.6 ? "text-[0.95rem]" : "text-[0.9rem]"

              return (
                <Link
                  key={tag}
                  href="/blog"
                  className={cn(
                    "inline-flex items-center rounded-full border border-border/60 bg-card/30 px-3 py-1 text-muted-foreground transition-colors hover:border-brand/40 hover:bg-brand/10 hover:text-brand",
                    size
                  )}
                >
                  {tag}
                </Link>
              )
            })}
          </div>
        </section>

        <section>
          <h3 className="text-base font-semibold text-foreground">Recents</h3>
          <ul className="mt-4 space-y-3">
            {recentPosts.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="block rounded-2xl border border-border/60 bg-card/30 p-4 transition-colors hover:border-brand/30 hover:bg-brand/5"
                >
                  <div className="text-sm font-semibold text-foreground transition-colors hover:text-brand">
                    {p.title}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {monthLabel(p.dateISO)} · {p.readTimeMins} min
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  )
}
