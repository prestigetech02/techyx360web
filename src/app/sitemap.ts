import type { MetadataRoute } from "next"

import { blogSitemapEntries, indexableRoutes } from "@/config/site"
import { absoluteUrl } from "@/lib/seo"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = indexableRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: route.lastModified ?? new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  const blogEntries: MetadataRoute.Sitemap = blogSitemapEntries.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  return [...staticEntries, ...blogEntries]
}
