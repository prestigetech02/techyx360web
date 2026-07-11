import Image from "next/image"
import Link from "next/link"

import { type BlogPost } from "@/config/blog"

function formatDate(iso: string) {
  const date = new Date(iso)
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function truncateWords(text: string, maxWords = 15) {
  const words = text.trim().split(/\s+/)
  if (words.length <= maxWords) return text.trim()
  return `${words.slice(0, maxWords).join(" ")}...`
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
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-sm text-muted-foreground">
          {formatDate(post.dateISO)} · {post.readTimeMins} min read
        </p>

        <h3 className="mt-3 text-base font-bold leading-snug tracking-tight text-foreground transition-colors duration-300 group-hover:text-brand sm:text-lg">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {truncateWords(post.excerpt, 15)}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full border border-brand/50 px-3 py-1 text-xs font-medium text-brand"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
