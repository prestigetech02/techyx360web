import type { BlogPost } from "@/config/blog"
import { blogPosts as staticBlogPosts } from "@/config/blog"
import { sortBlogPostsNewestFirst } from "@/lib/blog/listing"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import type { Database } from "@/types/database"

export type BlogPostRow = Database["public"]["Tables"]["blog_posts"]["Row"]

export type AdminBlogPost = BlogPost & {
  id?: string
  status: "published" | "draft"
  source: "database" | "static"
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

import { stripHtmlTags } from "@/lib/blog/content"

export function estimateReadTimeMins(content: string) {
  const plainText = stripHtmlTags(content)
  const words = plainText.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export function mapBlogPostRowToBlogPost(row: BlogPostRow): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    dateISO: row.published_at,
    modifiedAtISO: row.updated_at,
    readTimeMins: row.read_time_mins,
    tags: row.tags,
    author: row.author,
    featuredImage: row.featured_image,
    featuredImageAlt: row.featured_image_alt,
    metaDescription: row.meta_description ?? undefined,
    metaKeywords: row.meta_keywords?.length ? row.meta_keywords : undefined,
  }
}

export function mapBlogPostRowToAdminPost(row: BlogPostRow): AdminBlogPost {
  return {
    ...mapBlogPostRowToBlogPost(row),
    id: row.id,
    status: row.status as AdminBlogPost["status"],
    source: "database",
  }
}

function mapStaticPostToAdminPost(post: BlogPost): AdminBlogPost {
  return {
    ...post,
    modifiedAtISO: post.modifiedAtISO ?? post.dateISO,
    status: "published",
    source: "static",
  }
}

async function getDatabaseBlogPosts(options?: { publishedOnly?: boolean }) {
  if (!isSupabaseConfigured()) {
    return []
  }

  const supabase = createAdminClient()
  let query = supabase
    .from("blog_posts")
    .select(
      "id, slug, title, excerpt, content, author, tags, featured_image, featured_image_alt, meta_description, meta_keywords, read_time_mins, status, published_at, created_at, updated_at"
    )
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false })

  if (options?.publishedOnly) {
    query = query.eq("status", "published")
  }

  const { data, error } = await query

  if (error) {
    console.error("Failed to load blog posts from database", error)
    return []
  }

  return data ?? []
}

export async function getAdminBlogPosts(): Promise<AdminBlogPost[]> {
  const databaseRows = await getDatabaseBlogPosts()
  const databasePosts = databaseRows.map(mapBlogPostRowToAdminPost)
  const databaseSlugs = new Set(databasePosts.map((post) => post.slug))

  const legacyPosts = staticBlogPosts
    .filter((post) => !databaseSlugs.has(post.slug))
    .map(mapStaticPostToAdminPost)

  return sortBlogPostsNewestFirst([...databasePosts, ...legacyPosts])
}

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  const databaseRows = await getDatabaseBlogPosts({ publishedOnly: true })
  const databasePosts = databaseRows.map(mapBlogPostRowToBlogPost)
  const databaseSlugs = new Set(databasePosts.map((post) => post.slug))

  const legacyPosts = staticBlogPosts.filter(
    (post) => !databaseSlugs.has(post.slug)
  )

  return sortBlogPostsNewestFirst([...databasePosts, ...legacyPosts])
}

export async function getBlogPostBySlug(
  slug: string
): Promise<AdminBlogPost | null> {
  if (isSupabaseConfigured()) {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from("blog_posts")
      .select(
        "id, slug, title, excerpt, content, author, tags, featured_image, featured_image_alt, meta_description, meta_keywords, read_time_mins, status, published_at, created_at, updated_at"
      )
      .eq("slug", slug)
      .maybeSingle()

    if (data) {
      return mapBlogPostRowToAdminPost(data)
    }
  }

  const staticPost = staticBlogPosts.find((post) => post.slug === slug)
  return staticPost ? mapStaticPostToAdminPost(staticPost) : null
}
