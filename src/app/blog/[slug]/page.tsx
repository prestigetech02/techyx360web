import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, User } from "lucide-react"
import { notFound } from "next/navigation"

import { BlogPostContent } from "@/components/blog/blog-post-content"
import { BlogPostSidebar } from "@/components/blog/blog-post-sidebar"
import { BlogRelatedPosts } from "@/components/blog/blog-related-posts"
import { JsonLd } from "@/components/seo/json-ld"
import { Badge } from "@/components/ui/badge"
import type { BlogPost } from "@/config/blog"
import { brand, siteMetadata } from "@/config/brand"
import { organization } from "@/config/site"
import {
  getBlogPostBySlug,
  getPublishedBlogPosts,
} from "@/lib/blog/posts"
import { absoluteUrl, createPageMetadata } from "@/lib/seo"

export const dynamicParams = true

export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post || post.status !== "published") {
    return createPageMetadata({
      title: `Blog | ${brand.name}`,
      description: siteMetadata.description,
      path: "/blog",
      noIndex: true,
    })
  }

  return createPageMetadata({
    title: `${post.title} | ${brand.name}`,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    keywords: [...siteMetadata.keywords, ...post.tags],
    ogImage: post.featuredImage,
    type: "article",
  })
}

function getArticleSchema(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage,
    datePublished: post.dateISO,
    author: {
      "@type": "Organization",
      name: post.author,
      "@id": organization.id,
    },
    publisher: {
      "@id": organization.id,
    },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    keywords: post.tags.join(", "),
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post || post.status !== "published") notFound()

  const blogPosts = await getPublishedBlogPosts()

  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={getArticleSchema(post)} />

      <section className="relative overflow-hidden bg-[#0b2c66]">
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 h-72 w-72 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.22) 1.5px, transparent 1.5px)",
            backgroundSize: "14px 14px",
            WebkitMaskImage:
              "radial-gradient(ellipse at top right, rgba(0,0,0,1) 0%, transparent 70%)",
            maskImage:
              "radial-gradient(ellipse at top right, rgba(0,0,0,1) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <nav aria-label="Breadcrumb">
            <ol className="inline-flex flex-wrap items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white/70 backdrop-blur-sm">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  Home
                </Link>
              </li>
              <li aria-hidden className="text-white/40">
                /
              </li>
              <li>
                <Link href="/blog" className="transition-colors hover:text-white">
                  Blog
                </Link>
              </li>
              <li aria-hidden className="text-white/40">
                /
              </li>
              <li className="max-w-[12rem] truncate font-semibold text-white sm:max-w-xs">
                {post.title}
              </li>
            </ol>
          </nav>

          <div className="mt-8">
            <h1 className="text-2xl font-bold tracking-tight whitespace-nowrap text-white sm:text-3xl lg:text-4xl">
              {post.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-white/70 sm:text-sm">
              <span className="inline-flex items-center gap-1.5">
                <User className="size-3.5 text-brand" aria-hidden />
                {post.author}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5 text-brand" aria-hidden />
                {formatDate(post.dateISO)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5 text-brand" aria-hidden />
                {post.readTimeMins} min read
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-12 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-brand"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to all articles
          </Link>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_340px]">
            <article>
              <div className="relative mb-10 aspect-[21/9] overflow-hidden rounded-2xl border border-border/60">
                <Image
                  src={post.featuredImage}
                  alt={post.featuredImageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 760px"
                  className="object-cover"
                  priority
                />
              </div>

              <BlogPostContent content={post.content} />

              <div className="mt-8 flex flex-wrap gap-2 border-t border-border/60 pt-8">
                {post.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="border-brand/30 bg-brand/10 text-[0.7rem] font-semibold text-brand"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <BlogRelatedPosts posts={blogPosts} currentSlug={post.slug} />
            </article>

            <BlogPostSidebar
              posts={blogPosts}
              currentSlug={post.slug}
              activeTags={post.tags}
            />
          </div>
        </div>
      </section>
    </main>
  )
}
