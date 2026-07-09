import Link from "next/link"
import Image from "next/image"

import type { BlogPost } from "@/config/blog"
import { Badge } from "@/components/ui/badge"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function BlogRelatedPosts({
  posts,
  currentSlug,
}: {
  posts: BlogPost[]
  currentSlug: string
}) {
  const current = posts.find((post) => post.slug === currentSlug)
  if (!current) return null

  const related = posts
    .filter((post) => post.slug !== currentSlug)
    .map((post) => ({
      post,
      score: post.tags.filter((tag) => current.tags.includes(tag)).length,
    }))
    .sort((a, b) => b.score - a.score || +new Date(b.post.dateISO) - +new Date(a.post.dateISO))
    .slice(0, 3)
    .map(({ post }) => post)

  if (related.length === 0) return null

  return (
    <section className="mt-14 border-t border-border/60 pt-10">
      <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        Related articles
      </h2>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((post) => (
          <article
            key={post.slug}
            className="group overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:border-brand/30 hover:shadow-[0_12px_40px_rgba(15,23,42,0.06)]"
          >
            <Link
              href={`/blog/${post.slug}`}
              className="relative block aspect-[16/10] overflow-hidden"
            >
              <Image
                src={post.featuredImage}
                alt={post.featuredImageAlt}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </Link>

            <div className="p-5">
              <p className="text-xs text-muted-foreground">
                {formatDate(post.dateISO)} · {post.readTimeMins} min read
              </p>

              <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-brand">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h3>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {post.tags.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="border-brand/20 bg-brand/5 text-[0.65rem] font-semibold text-brand"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
