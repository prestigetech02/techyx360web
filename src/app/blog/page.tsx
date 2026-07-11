import type { Metadata } from "next"
import Link from "next/link"

import { BlogCard } from "@/components/blog/blog-card"
import { BlogPagination } from "@/components/blog/blog-pagination"
import { BlogSidebar } from "@/components/blog/blog-sidebar"
import { PageHeroBanner } from "@/components/layout/page-hero-banner"
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld"
import { brand, siteMetadata } from "@/config/brand"
import {
  filterBlogPosts,
  formatArchiveLabel,
  paginateBlogPosts,
} from "@/lib/blog/listing"
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

type BlogPageProps = {
  searchParams: Promise<{
    page?: string
    month?: string
    tag?: string
  }>
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams
  const activeMonth = params.month?.trim() || undefined
  const activeTag = params.tag?.trim() || undefined
  const requestedPage = Number(params.page ?? "1")
  const page =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.floor(requestedPage)
      : 1

  const allPosts = await getPublishedBlogPosts()
  const filteredPosts = filterBlogPosts(allPosts, {
    month: activeMonth,
    tag: activeTag,
  })
  const { posts, currentPage, totalPages, totalPosts } = paginateBlogPosts(
    filteredPosts,
    page
  )

  const filterLabel = activeMonth
    ? formatArchiveLabel(activeMonth)
    : activeTag
      ? activeTag
      : null

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
          <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[1fr_3fr] lg:items-start">
            <section aria-label="Blog posts" className="order-1 lg:col-start-2">
              {filterLabel ? (
                <div className="mb-6 rounded-2xl border border-border/60 bg-card/40 px-4 py-3 text-sm text-muted-foreground">
                  Showing {totalPosts} post{totalPosts === 1 ? "" : "s"}
                  {activeMonth ? ` from ${filterLabel}` : ` tagged "${activeTag}"`}
                </div>
              ) : null}

              {posts.length > 0 ? (
                <>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                      <BlogCard key={post.slug} post={post} />
                    ))}
                  </div>

                  <BlogPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    month={activeMonth}
                    tag={activeTag}
                  />
                </>
              ) : (
                <div className="rounded-2xl border border-border/60 bg-card/40 px-6 py-12 text-center">
                  <p className="text-base font-semibold text-foreground">
                    No posts found
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Try another archive month or clear your filters.
                  </p>
                  <Link
                    href="/blog"
                    className="mt-5 inline-flex text-sm font-medium text-brand transition-colors hover:text-[#eaaa33]"
                  >
                    View all posts
                  </Link>
                </div>
              )}
            </section>

            <BlogSidebar
              posts={allPosts}
              activeMonth={activeMonth}
              activeTag={activeTag}
              className="order-2 lg:col-start-1 lg:row-start-1"
            />
          </div>
        </div>
      </section>
    </main>
  )
}
