import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { BlogCard } from "@/components/blog/blog-card"
import { BlogSidebar } from "@/components/blog/blog-sidebar"
import { brand, siteMetadata } from "@/config/brand"
import { getPublishedBlogPosts } from "@/lib/blog/posts"
import { createPageMetadata } from "@/lib/seo"

const bgImage = "/mobile.jpg"

export const metadata: Metadata = createPageMetadata({
  title: `Blog | ${brand.name} - IT Solutions & Insights`,
  description:
    "Read Techyx360 articles on mobile app development, web development, digital marketing, QA, security, and practical IT delivery.",
  path: "/blog",
  keywords: [
    ...siteMetadata.keywords,
    "Techyx360 blog",
    "mobile app development",
    "IT consulting",
  ],
})

export default async function BlogPage() {
  const blogPosts = await getPublishedBlogPosts()

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden">
        <Image
          src={bgImage}
          alt=""
          aria-hidden
          fill
          priority
          className="object-cover opacity-30"
        />

        <div className="absolute inset-0 bg-[#0b2c66]/90" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Blog
          </h1>

          <nav aria-label="Breadcrumb" className="mt-5">
            <ol className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/70 backdrop-blur-sm">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  Home
                </Link>
              </li>
              <li aria-hidden className="text-white/40">
                /
              </li>
              <li className="font-semibold text-white">Blog</li>
            </ol>
          </nav>
        </div>
      </section>

      <section className="bg-background py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_3fr]">
            <BlogSidebar posts={blogPosts} />

            <section aria-label="Blog posts">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {blogPosts.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}
