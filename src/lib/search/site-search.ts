import { blogPosts } from "@/config/blog"
import { navigation } from "@/config/navigation"
import { services } from "@/config/services"
import type { SearchResult } from "@/types/search"

const staticPages: SearchResult[] = [
  {
    id: "page-home",
    title: "Home",
    description: "Techyx360 IT solutions company in Nigeria",
    href: "/",
    category: "Page",
  },
  {
    id: "page-about",
    title: "About Us",
    description: "Learn about Techyx360 and our mission",
    href: "/about",
    category: "Page",
  },
  {
    id: "page-contact",
    title: "Contact",
    description: "Get in touch with the Techyx360 team",
    href: "/contact",
    category: "Page",
  },
  {
    id: "page-blog",
    title: "Blog",
    description: "Articles on IT, software, and digital growth",
    href: "/blog",
    category: "Page",
  },
  {
    id: "page-privacy",
    title: "Privacy Policy",
    description: "How we collect and protect your information",
    href: "/privacy-policy",
    category: "Page",
  },
  {
    id: "page-register",
    title: "Register for a Program",
    description: "Browse and register for Techyx360 training courses",
    href: "/trainings/register",
    category: "Training",
  },
  {
    id: "training-eva",
    title: "Executive Virtual Assistance",
    description: "Become a professional executive virtual assistant",
    href: "/trainings/executive-virtual-assistance",
    category: "Training",
  },
]

function getNavigationResults(): SearchResult[] {
  const results: SearchResult[] = []

  for (const item of navigation) {
    if (item.href) {
      results.push({
        id: `nav-${item.href}`,
        title: item.label,
        description: `Navigate to ${item.label}`,
        href: item.href,
        category: "Page",
      })
    }

    if (item.children) {
      for (const child of item.children) {
        results.push({
          id: `nav-${child.href}`,
          title: child.label,
          description: child.description ?? child.label,
          href: child.href,
          category: item.label === "Services" ? "Service" : "Training",
        })
      }
    }
  }

  return results
}

function getServiceResults(): SearchResult[] {
  return services.map((service) => ({
    id: `service-${service.href}`,
    title: service.title,
    description: service.description,
    href: service.href,
    category: "Service" as const,
  }))
}

function getStaticBlogResults(): SearchResult[] {
  return blogPosts.map((post) => ({
    id: `blog-${post.slug}`,
    title: post.title,
    description: post.excerpt,
    href: `/blog/${post.slug}`,
    category: "Blog" as const,
  }))
}

export function getStaticSearchIndex(): SearchResult[] {
  const merged = new Map<string, SearchResult>()

  for (const item of [
    ...staticPages,
    ...getNavigationResults(),
    ...getServiceResults(),
    ...getStaticBlogResults(),
  ]) {
    merged.set(item.href, item)
  }

  return Array.from(merged.values())
}

function normalize(value: string) {
  return value.toLowerCase().trim()
}

function scoreResult(query: string, item: SearchResult) {
  const q = normalize(query)
  const title = normalize(item.title)
  const description = normalize(item.description)

  if (title === q) return 100
  if (title.startsWith(q)) return 80
  if (title.includes(q)) return 60
  if (description.includes(q)) return 40
  if (q.split(/\s+/).some((word) => title.includes(word) || description.includes(word))) {
    return 20
  }

  return 0
}

export function searchStaticIndex(query: string, items: SearchResult[]) {
  const trimmed = query.trim()
  if (!trimmed) return []

  return items
    .map((item) => ({ item, score: scoreResult(trimmed, item) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .map(({ item }) => item)
    .slice(0, 12)
}

export function mergeSearchResults(
  primary: SearchResult[],
  secondary: SearchResult[]
) {
  const merged = new Map<string, SearchResult>()

  for (const item of [...primary, ...secondary]) {
    merged.set(item.href, item)
  }

  return Array.from(merged.values()).slice(0, 12)
}
