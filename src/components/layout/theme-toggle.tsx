"use client"

import { MoonIcon, SunIcon } from "lucide-react"

import { useTheme } from "@/components/providers/theme-provider"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme !== "light"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative shrink-0 touch-manipulation inline-flex h-10 min-h-11 min-w-11 items-center gap-1.5 overflow-hidden rounded-full bg-muted px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/80 active:bg-muted/70 active:scale-[0.98] md:h-9 md:min-h-0 md:min-w-0 md:gap-2 md:px-3.5 md:text-base",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <SunIcon className="size-4 md:size-[18px]" aria-hidden />
      ) : (
        <MoonIcon className="size-4 md:size-[18px]" aria-hidden />
      )}
      <span className="hidden min-[400px]:inline">
        {isDark ? "Light" : "Dark"}
      </span>
    </button>
  )
}
