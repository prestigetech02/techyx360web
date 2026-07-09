"use client"

import { MoonIcon, SunIcon } from "lucide-react"

import { useTheme } from "@/components/providers/theme-provider"
import { cn } from "@/lib/utils"

type AdminThemeToggleProps = {
  className?: string
}

export function AdminThemeToggle({ className }: AdminThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme !== "light"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <SunIcon className="size-5" aria-hidden />
      ) : (
        <MoonIcon className="size-5" aria-hidden />
      )}
    </button>
  )
}
