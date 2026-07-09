"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Loader2, SearchIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import type { SearchResult } from "@/types/search"
import { cn } from "@/lib/utils"

type SiteSearchInputProps = {
  autoFocus?: boolean
  placeholder?: string
  className?: string
  inputClassName?: string
  onNavigate?: () => void
}

const categoryStyles: Record<SearchResult["category"], string> = {
  Page: "bg-muted text-muted-foreground",
  Service: "bg-brand/10 text-brand",
  Training: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  Blog: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
}

export function SiteSearchInput({
  autoFocus = false,
  placeholder = "Search pages, services, trainings, blog...",
  className,
  inputClassName,
  onNavigate,
}: SiteSearchInputProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const trimmed = query.trim()

    if (!trimmed) {
      setResults([])
      setHasSearched(false)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}`
        )
        const data = (await response.json()) as {
          results?: SearchResult[]
        }

        setResults(data.results ?? [])
        setHasSearched(true)
      } catch {
        setResults([])
        setHasSearched(true)
      } finally {
        setIsLoading(false)
      }
    }, 280)

    return () => window.clearTimeout(timer)
  }, [query])

  const showEmptyState = useMemo(
    () => hasSearched && !isLoading && query.trim() && results.length === 0,
    [hasSearched, isLoading, query, results.length]
  )

  const handleSelect = (href: string) => {
    onNavigate?.()
    setQuery("")
    setResults([])
    setHasSearched(false)
    router.push(href)
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative">
        <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn("pl-9", inputClassName)}
          aria-label="Search website"
        />
        {isLoading ? (
          <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      {results.length > 0 ? (
        <ul className="max-h-80 overflow-y-auto rounded-xl border border-border/60 bg-background">
          {results.map((result) => (
            <li key={result.id}>
              <button
                type="button"
                onClick={() => handleSelect(result.href)}
                className="flex w-full items-start gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/50"
              >
                <span
                  className={cn(
                    "mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide uppercase",
                    categoryStyles[result.category]
                  )}
                >
                  {result.category}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">
                    {result.title}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {result.description}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {showEmptyState ? (
        <p className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          No results for &quot;{query.trim()}&quot;. Try searching for a service,
          training program, or blog topic.
        </p>
      ) : null}

      {!query.trim() ? (
        <p className="text-xs text-muted-foreground">
          Popular:{" "}
          {["Web Development", "Bootcamps", "Blog", "Contact"].map((term, index) => (
            <span key={term}>
              {index > 0 ? ", " : ""}
              <button
                type="button"
                className="font-medium text-brand hover:underline"
                onClick={() => setQuery(term)}
              >
                {term}
              </button>
            </span>
          ))}
        </p>
      ) : null}
    </div>
  )
}

export function SiteSearchQuickLinks({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  const links = [
    { label: "Services", href: "/services/web-development" },
    { label: "Trainings", href: "/trainings/register" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-brand/40 hover:bg-brand/10 hover:text-brand"
        >
          {link.label}
        </Link>
      ))}
    </div>
  )
}
