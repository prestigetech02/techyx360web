import type { BlogPost } from "@/config/blog"
import { siteMetadata } from "@/config/brand"
import { createPageMetadata } from "@/lib/seo"

export function getBlogPostSeoKeywords(post: BlogPost) {
  if (post.metaKeywords?.length) {
    return post.metaKeywords
  }

  return post.tags
}

export function getBlogPostSeoDescription(post: BlogPost) {
  return post.metaDescription?.trim() || post.excerpt
}

export function createBlogPostMetadata(post: BlogPost) {
  const keywords = getBlogPostSeoKeywords(post)

  return createPageMetadata({
    title: post.title,
    description: getBlogPostSeoDescription(post),
    path: `/blog/${post.slug}`,
    keywords: [...siteMetadata.keywords.slice(0, 4), ...keywords],
    ogImage: post.featuredImage,
    ogImageAlt: post.featuredImageAlt || post.title,
    type: "article",
    article: {
      publishedTime: post.dateISO,
      modifiedTime: post.modifiedAtISO ?? post.dateISO,
      authors: [post.author],
      tags: post.tags,
    },
  })
}
