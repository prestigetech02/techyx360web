import Image from "next/image"
import Link from "next/link"
import { Clock, Tag } from "lucide-react"

import type { BlogPost } from "@/config/blog"
import { BrandCtaButton } from "@/components/ui/brand-cta-button"
import { cn } from "@/lib/utils"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function monthLabel(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  })
}

export function BlogPostSidebar({
  posts,
  currentSlug,
  activeTags = [],
}: {
  posts: BlogPost[]
  currentSlug: string
  activeTags?: string[]
}) {
  const recentPosts = [...posts]
    .filter((post) => post.slug !== currentSlug)
    .sort((a, b) => +new Date(b.dateISO) - +new Date(a.dateISO))
    .slice(0, 4)

  const tagCount = new Map<string, number>()
  posts.forEach((post) =>
    post.tags.forEach((tag) => tagCount.set(tag, (tagCount.get(tag) ?? 0) + 1))
  )
  const tags = [...tagCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)

  const archiveMap = new Map<string, number>()
  posts.forEach((post) => {
    const key = monthLabel(post.dateISO)
    archiveMap.set(key, (archiveMap.get(key) ?? 0) + 1)
  })
  const archiveList = [...archiveMap.entries()].slice(0, 6)

  return (
    <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      <section className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-[#0b2c66] to-[#0f3d8a] p-6 text-white">
        <p className="text-xs font-semibold tracking-[0.18em] text-brand uppercase">
          Work with us
        </p>
        <h3 className="mt-2 text-lg font-bold tracking-tight">
          Need help building your next product?
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-white/75">
          From mobile apps to digital marketing, our team helps you ship with
          confidence.
        </p>
        <BrandCtaButton href="/contact" className="mt-5 h-10 w-full">
          Get in touch
        </BrandCtaButton>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-brand" aria-hidden />
          <h3 className="text-base font-semibold text-foreground">Recent posts</h3>
        </div>

        <ul className="mt-4 space-y-4">
          {recentPosts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex gap-3 rounded-xl p-2 transition-colors hover:bg-muted/50"
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={post.featuredImage}
                    alt={post.featuredImageAlt}
                    fill
                    sizes="64px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-brand">
                    {post.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(post.dateISO)} · {post.readTimeMins} min
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Tag className="size-4 text-brand" aria-hidden />
          <h3 className="text-base font-semibold text-foreground">Popular tags</h3>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map(([tag, count]) => (
            <Link
              key={tag}
              href="/blog"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                activeTags.includes(tag)
                  ? "border-brand/40 bg-brand/10 text-brand"
                  : "border-border/60 bg-background text-muted-foreground hover:border-brand/30 hover:bg-brand/5 hover:text-brand"
              )}
            >
              {tag}
              <span className="text-[0.65rem] opacity-70">({count})</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
        <h3 className="text-base font-semibold text-foreground">Archives</h3>
        <ul className="mt-4 space-y-2">
          {archiveList.map(([label, count]) => (
            <li key={label}>
              <Link
                href="/blog"
                className="flex items-center justify-between rounded-xl border border-border/50 bg-background/60 px-3 py-2.5 text-sm transition-colors hover:border-brand/30 hover:bg-brand/5"
              >
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium text-foreground/70">{count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}
