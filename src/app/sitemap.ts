import type { MetadataRoute } from "next"

import { indexableRoutes } from "@/config/site"
import { getPublishedBlogPosts } from "@/lib/blog/posts"
import { getOpenJobOpenings } from "@/lib/careers/openings"
import { absoluteUrl } from "@/lib/seo"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = indexableRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: route.lastModified ?? new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  const posts = await getPublishedBlogPosts()
  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: post.dateISO,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  const openings = await getOpenJobOpenings()
  const careerEntries: MetadataRoute.Sitemap = openings.map((position) => ({
    url: absoluteUrl(`/careers/${position.id}`),
    lastModified: position.updatedAt || position.postedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  return [...staticEntries, ...blogEntries, ...careerEntries]
}
