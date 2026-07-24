"use client"

import { useRouter } from "next/navigation"
import { Loader2, Search } from "lucide-react"
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react"

import { Input } from "@/components/ui/input"
import type {
  AdminSearchCategory,
  AdminSearchResult,
} from "@/types/admin-search"
import { cn } from "@/lib/utils"

const categoryStyles: Record<AdminSearchCategory, string> = {
  Page: "bg-muted text-muted-foreground",
  Lead: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  Client: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Contact: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  Registration: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
  PIF: "bg-amber-500/10 text-amber-800 dark:text-amber-300",
  Career: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  Talent: "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
  Team: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  Project: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  Invoice: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  Blog: "bg-lime-500/10 text-lime-800 dark:text-lime-300",
}

type AdminGlobalSearchProps = {
  className?: string
  inputClassName?: string
  compact?: boolean
}

export function AdminGlobalSearch({
  className,
  inputClassName,
  compact = false,
}: AdminGlobalSearchProps) {
  const router = useRouter()
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<AdminSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
        setActiveIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    function handleShortcut(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }

    document.addEventListener("keydown", handleShortcut)
    return () => document.removeEventListener("keydown", handleShortcut)
  }, [])

  useEffect(() => {
    const trimmed = query.trim()

    if (trimmed.length < 2) {
      setResults([])
      setHasSearched(false)
      setIsLoading(false)
      setActiveIndex(-1)
      return
    }

    setIsLoading(true)
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/admin/search?q=${encodeURIComponent(trimmed)}`
        )
        const data = (await response.json()) as {
          results?: AdminSearchResult[]
        }
        setResults(data.results ?? [])
        setHasSearched(true)
        setActiveIndex(-1)
        setOpen(true)
      } catch {
        setResults([])
        setHasSearched(true)
        setOpen(true)
      } finally {
        setIsLoading(false)
      }
    }, 280)

    return () => window.clearTimeout(timer)
  }, [query])

  const showPanel = open && query.trim().length >= 2
  const showEmpty =
    showPanel && hasSearched && !isLoading && results.length === 0

  const hint = useMemo(
    () => (compact ? null : "Ctrl K"),
    [compact]
  )

  function selectResult(result: AdminSearchResult) {
    setQuery("")
    setResults([])
    setHasSearched(false)
    setOpen(false)
    setActiveIndex(-1)
    router.push(result.href)
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false)
      setActiveIndex(-1)
      inputRef.current?.blur()
      return
    }

    if (!showPanel || results.length === 0) return

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((index) =>
        index < results.length - 1 ? index + 1 : 0
      )
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((index) =>
        index > 0 ? index - 1 : results.length - 1
      )
      return
    }

    if (event.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
      event.preventDefault()
      selectResult(results[activeIndex])
    }
  }

  return (
    <div ref={rootRef} className={cn("relative min-w-0", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          if (query.trim().length >= 2) setOpen(true)
        }}
        onKeyDown={onKeyDown}
        placeholder="Search leads, clients, apps..."
        className={cn(
          "h-10 rounded-xl border-border/80 bg-muted/50 pr-16 pl-9",
          inputClassName
        )}
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
        }
        autoComplete="off"
      />
      {isLoading ? (
        <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      ) : hint ? (
        <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 items-center rounded-md border border-border/70 bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
          {hint}
        </kbd>
      ) : null}

      {showPanel ? (
        <div
          id={listId}
          role="listbox"
          className="absolute top-[calc(100%+0.5rem)] left-0 z-50 w-full min-w-[min(100%,22rem)] overflow-hidden rounded-xl border border-border/60 bg-popover text-popover-foreground shadow-lg sm:min-w-[28rem]"
        >
          {isLoading && results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              Searching...
            </p>
          ) : null}

          {results.length > 0 ? (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((result, index) => (
                <li key={result.id} role="presentation">
                  <button
                    type="button"
                    id={`${listId}-option-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectResult(result)}
                    className={cn(
                      "flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors",
                      index === activeIndex
                        ? "bg-muted"
                        : "hover:bg-muted/60"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                        categoryStyles[result.category]
                      )}
                    >
                      {result.category}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {result.title}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {result.description}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {showEmpty ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              No results for &quot;{query.trim()}&quot;.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
