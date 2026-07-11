import type { BlogPost } from "@/config/blog"

export const BLOG_POSTS_PER_PAGE = 9

export type BlogListFilters = {
  month?: string
  tag?: string
  page?: number
}

export function getMonthKey(dateISO: string) {
  const date = new Date(dateISO)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

export function formatArchiveLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number)
  if (!year || !month) return monthKey

  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  })
}

export function sortBlogPostsNewestFirst<
  T extends { dateISO: string; modifiedAtISO?: string },
>(posts: T[]) {
  return [...posts].sort((left, right) => {
    const dateDiff =
      new Date(right.dateISO).getTime() - new Date(left.dateISO).getTime()

    if (dateDiff !== 0) return dateDiff

    const modifiedDiff =
      new Date(right.modifiedAtISO ?? right.dateISO).getTime() -
      new Date(left.modifiedAtISO ?? left.dateISO).getTime()

    return modifiedDiff
  })
}

export function filterBlogPosts(
  posts: BlogPost[],
  filters: Pick<BlogListFilters, "month" | "tag">
) {
  return posts.filter((post) => {
    if (filters.month && getMonthKey(post.dateISO) !== filters.month) {
      return false
    }

    if (
      filters.tag &&
      !post.tags.some(
        (tag) => tag.toLowerCase() === filters.tag?.toLowerCase()
      )
    ) {
      return false
    }

    return true
  })
}

export function paginateBlogPosts(posts: BlogPost[], page: number) {
  const totalPosts = posts.length
  const totalPages = Math.max(1, Math.ceil(totalPosts / BLOG_POSTS_PER_PAGE))
  const currentPage = Math.min(Math.max(page, 1), totalPages)
  const start = (currentPage - 1) * BLOG_POSTS_PER_PAGE

  return {
    posts: posts.slice(start, start + BLOG_POSTS_PER_PAGE),
    currentPage,
    totalPages,
    totalPosts,
  }
}

export function buildBlogListHref(filters: BlogListFilters = {}) {
  const params = new URLSearchParams()

  if (filters.month) {
    params.set("month", filters.month)
  }

  if (filters.tag) {
    params.set("tag", filters.tag)
  }

  if (filters.page && filters.page > 1) {
    params.set("page", String(filters.page))
  }

  const query = params.toString()
  return query ? `/blog?${query}` : "/blog"
}

export function getBlogArchiveEntries(posts: BlogPost[]) {
  const archiveMap = new Map<string, number>()

  posts.forEach((post) => {
    const key = getMonthKey(post.dateISO)
    archiveMap.set(key, (archiveMap.get(key) ?? 0) + 1)
  })

  return [...archiveMap.entries()]
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([monthKey, count]) => ({
      monthKey,
      label: formatArchiveLabel(monthKey),
      count,
    }))
}

export function getBlogTagEntries(posts: BlogPost[]) {
  const tagCount = new Map<string, number>()

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagCount.set(tag, (tagCount.get(tag) ?? 0) + 1)
    })
  })

  return [...tagCount.entries()].sort((left, right) => right[1] - left[1])
}
