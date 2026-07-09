"use client"

import Link from "next/link"
import { useMemo } from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import {
  CalendarDays,
  Eye,
  FilePenLine,
  FileText,
  MoreHorizontal,
  Newspaper,
  Pencil,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { AdminBlogPost } from "@/lib/blog/posts"
import { cn } from "@/lib/utils"

type BlogPostsDashboardProps = {
  posts: AdminBlogPost[]
}

function isThisMonth(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  )
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    dateStyle: "medium",
  })
}

function truncate(text: string, maxLength = 60) {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}…`
}

function statusBadgeClass(status: AdminBlogPost["status"]) {
  switch (status) {
    case "published":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
    case "draft":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  accent: string
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-3 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground sm:text-sm">{label}</p>
          <p className="mt-1 text-xl font-bold tracking-tight text-foreground sm:mt-2 sm:text-3xl">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg sm:size-10 sm:rounded-xl",
            accent
          )}
        >
          <Icon className="size-4 sm:size-5" aria-hidden />
        </div>
      </div>
    </div>
  )
}

function PostActionsMenu({ post }: { post: AdminBlogPost }) {
  const menuItemClassName =
    "flex w-full cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground outline-none select-none data-highlighted:bg-muted"

  return (
    <MenuPrimitive.Root modal={false}>
      <MenuPrimitive.Trigger
        aria-label="Open post actions"
        className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <MoreHorizontal className="size-4" aria-hidden />
      </MenuPrimitive.Trigger>

      <MenuPrimitive.Portal>
        <MenuPrimitive.Positioner
          side="bottom"
          align="end"
          sideOffset={4}
          className="z-50 outline-none"
        >
          <MenuPrimitive.Popup className="min-w-44 overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none">
            {post.status === "published" ? (
              <MenuPrimitive.Item
                className={menuItemClassName}
                render={
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <Eye className="size-4" aria-hidden />
                View on site
              </MenuPrimitive.Item>
            ) : null}
            {post.source === "database" ? (
              <MenuPrimitive.Item
                className={menuItemClassName}
                render={<Link href={`/admin/blog/${post.slug}/edit`} />}
              >
                <Pencil className="size-4" aria-hidden />
                Edit post
              </MenuPrimitive.Item>
            ) : null}
          </MenuPrimitive.Popup>
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  )
}

export function BlogPostsDashboard({ posts }: BlogPostsDashboardProps) {
  const stats = useMemo(() => {
    const total = posts.length
    const published = posts.filter((post) => post.status === "published").length
    const drafts = posts.filter((post) => post.status === "draft").length
    const thisMonth = posts.filter((post) => isThisMonth(post.dateISO)).length

    return { total, published, drafts, thisMonth }
  }, [posts])

  return (
    <div className="min-w-0 space-y-6">
      <div className="grid min-w-0 grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          label="Total posts"
          value={stats.total}
          icon={Newspaper}
          accent="bg-brand/10 text-brand"
        />
        <StatCard
          label="Published"
          value={stats.published}
          icon={FileText}
          accent="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
        />
        <StatCard
          label="Drafts"
          value={stats.drafts}
          icon={FilePenLine}
          accent="bg-amber-500/10 text-amber-700 dark:text-amber-400"
        />
        <StatCard
          label="This month"
          value={stats.thisMonth}
          icon={CalendarDays}
          accent="bg-violet-500/10 text-violet-700 dark:text-violet-400"
        />
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Posts</h2>
          <p className="text-sm text-muted-foreground">
            Manage blog articles shown on the public website.
          </p>
        </div>

        {posts.length > 0 ? (
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <th className="px-6 py-3">Title</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Published</th>
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-4 py-3">Read time</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {posts.map((post) => (
                  <tr
                    key={post.slug}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <td className="max-w-[280px] px-6 py-4 font-medium text-foreground">
                      <span title={post.title}>{truncate(post.title, 48)}</span>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {post.author}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        className={cn(
                          "font-semibold uppercase",
                          statusBadgeClass(post.status)
                        )}
                      >
                        {post.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">
                      {formatDate(post.dateISO)}
                    </td>
                    <td className="max-w-[180px] px-4 py-4 text-foreground/80">
                      <span title={post.tags.join(", ")}>
                        {post.tags.length > 0
                          ? `${post.tags[0]}${post.tags.length > 1 ? ` +${post.tags.length - 1}` : ""}`
                          : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">
                      {post.readTimeMins} min
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <PostActionsMenu post={post} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No blog posts yet.
          </div>
        )}
      </div>
    </div>
  )
}
