import type { Metadata } from "next"
import Link from "next/link"

import { BlogCard } from "@/components/blog/blog-card"
import { BlogSidebar } from "@/components/blog/blog-sidebar"
import { PageHeroBanner } from "@/components/layout/page-hero-banner"
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld"
import { brand, siteMetadata } from "@/config/brand"
import { getPublishedBlogPosts } from "@/lib/blog/posts"
import { createPageMetadata } from "@/lib/seo"

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
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ]}
      />
      <PageHeroBanner title="Blog">
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
      </PageHeroBanner>

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
