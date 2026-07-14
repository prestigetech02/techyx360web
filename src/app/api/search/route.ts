import { NextResponse } from "next/server"

import { getPublishedBlogPosts } from "@/lib/blog/posts"
import { getOpenJobOpenings } from "@/lib/careers/openings"
import {
  getStaticSearchIndex,
  mergeSearchResults,
  searchStaticIndex,
} from "@/lib/search/site-search"
import type { SearchResult } from "@/types/search"

function searchBlogPosts(
  query: string,
  posts: Awaited<ReturnType<typeof getPublishedBlogPosts>>
) {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return []

  return posts
    .filter((post) => {
      const haystack = [post.title, post.excerpt, ...post.tags, post.author]
        .join(" ")
        .toLowerCase()

      return (
        haystack.includes(trimmed) ||
        trimmed.split(/\s+/).some((word) => haystack.includes(word))
      )
    })
    .slice(0, 8)
    .map(
      (post): SearchResult => ({
        id: `blog-${post.slug}`,
        title: post.title,
        description: post.excerpt,
        href: `/blog/${post.slug}`,
        category: "Blog",
      })
    )
}

function searchJobOpenings(
  query: string,
  openings: Awaited<ReturnType<typeof getOpenJobOpenings>>
) {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return []

  return openings
    .filter((opening) => {
      const haystack = [
        opening.title,
        opening.description,
        opening.department,
        opening.location,
        opening.type,
      ]
        .join(" ")
        .toLowerCase()

      return (
        haystack.includes(trimmed) ||
        trimmed.split(/\s+/).some((word) => haystack.includes(word))
      )
    })
    .slice(0, 8)
    .map(
      (opening): SearchResult => ({
        id: `career-${opening.id}`,
        title: opening.title,
        description: opening.description,
        href: `/careers/${opening.id}`,
        category: "Page",
      })
    )
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim() ?? ""

  if (!query) {
    return NextResponse.json({ query, results: [] })
  }

  const staticIndex = getStaticSearchIndex()
  const staticResults = searchStaticIndex(query, staticIndex)

  let blogResults: SearchResult[] = []
  let careerResults: SearchResult[] = []

  try {
    const posts = await getPublishedBlogPosts()
    blogResults = searchBlogPosts(query, posts)
  } catch (error) {
    console.error("Search blog lookup failed", error)
  }

  try {
    const openings = await getOpenJobOpenings()
    careerResults = searchJobOpenings(query, openings)
  } catch (error) {
    console.error("Search career lookup failed", error)
  }

  const results = mergeSearchResults(
    mergeSearchResults(blogResults, careerResults),
    staticResults
  )

  return NextResponse.json({ query, results })
}
