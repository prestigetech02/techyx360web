import Image from "next/image"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { type BlogPost } from "@/config/blog"

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short" })
}

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:border-brand/40 hover:shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
      <Link
        href={`/blog/${post.slug}`}
        className="relative block aspect-[16/10] overflow-hidden"
      >
        <Image
          src={post.featuredImage}
          alt={post.featuredImageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />

        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <div className="absolute inset-0 -translate-x-full rotate-12 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)] transition-transform duration-700 group-hover:translate-x-full" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-semibold tracking-tight text-foreground transition-colors duration-300 group-hover:text-brand">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatDate(post.dateISO)} · {post.readTimeMins} min read
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="border-brand/30 bg-brand/10 text-[0.7rem] font-semibold text-brand"
            >
              {tag}
            </Badge>
          ))}
        </div>

        <div className="mt-auto pt-6">
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center rounded-full border border-border/60 bg-background/40 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-brand/40 hover:bg-brand/10 hover:text-brand"
          >
            Read more
          </Link>
        </div>
      </div>
    </article>
  )
}
