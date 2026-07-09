import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

import { BlogPostForm } from "@/components/admin/blog-post-form"
import { Button } from "@/components/ui/button"
import { brand } from "@/config/brand"
import { getBlogPostBySlug } from "@/lib/blog/posts"

export const metadata = {
  title: `Edit Post | Blog | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

type AdminBlogEditPageProps = {
  params: Promise<{ slug: string }>
}

export default async function AdminBlogEditPage({
  params,
}: AdminBlogEditPageProps) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  if (post.source !== "database") {
    return (
      <div className="min-w-0 space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            render={<Link href="/admin/blog" />}
            aria-label="Back to blog posts"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
              Content
            </p>
            <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
              Edit post
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{post.title}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
          <p className="text-sm text-muted-foreground sm:text-base">
            This article was created from the static blog config. Create a new
            post in Supabase to manage editable posts from the admin dashboard.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              className="bg-brand text-brand-foreground hover:bg-brand/90"
              render={
                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              View on site
            </Button>
            <Button variant="outline" render={<Link href="/admin/blog" />}>
              Back to posts
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          render={<Link href="/admin/blog" />}
          aria-label="Back to blog posts"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            Content
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
            Edit post
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{post.title}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
        <BlogPostForm
          mode="edit"
          postId={post.id}
          initialValues={{
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            author: post.author,
            tags: post.tags.join(", "),
            featuredImage: post.featuredImage,
            featuredImageAlt: post.featuredImageAlt,
            publishedAt: post.dateISO,
            status: post.status,
          }}
        />
      </div>
    </div>
  )
}
