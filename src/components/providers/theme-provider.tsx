"use client"

import { useServerInsertedHTML } from "next/navigation"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

type Theme = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

type ThemeProviderProps = {
  children: ReactNode
  attribute?: "class"
  defaultTheme?: Theme
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  storageKey?: string
}

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = "theme"

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") return getSystemTheme()
  return theme
}

function getStoredTheme(
  storageKey: string,
  defaultTheme: Theme,
  enableSystem: boolean
): Theme {
  try {
    const stored = localStorage.getItem(storageKey) as Theme | null
    if (
      stored === "light" ||
      stored === "dark" ||
      (stored === "system" && enableSystem)
    ) {
      return stored
    }
  } catch {
    // localStorage may be unavailable
  }

  return defaultTheme
}

function applyTheme(
  resolved: ResolvedTheme,
  disableTransitionOnChange: boolean
) {
  const root = document.documentElement

  if (disableTransitionOnChange) {
    root.classList.add("disable-theme-transitions")
  }

  root.classList.remove("light", "dark")
  root.classList.add(resolved)
  root.style.colorScheme = resolved

  if (disableTransitionOnChange) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove("disable-theme-transitions")
      })
    })
  }
}

function buildThemeScript(
  storageKey: string,
  defaultTheme: Theme,
  enableSystem: boolean
) {
  return `(function(){try{var k=${JSON.stringify(storageKey)},d=${JSON.stringify(defaultTheme)},s=${enableSystem};var t=localStorage.getItem(k);if(t!=='light'&&t!=='dark'&&!(t==='system'&&s))t=d;if(t==='system')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';var r=document.documentElement;r.classList.remove('light','dark');r.classList.add(t);r.style.colorScheme=t}catch(e){}})();`
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  enableSystem = false,
  disableTransitionOnChange = false,
  storageKey = STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(
    defaultTheme === "system" ? "dark" : defaultTheme
  )

  useServerInsertedHTML(() => (
    <script
      dangerouslySetInnerHTML={{
        __html: buildThemeScript(storageKey, defaultTheme, enableSystem),
      }}
    />
  ))

  useEffect(() => {
    const stored = getStoredTheme(storageKey, defaultTheme, enableSystem)
    const resolved = resolveTheme(stored)

    setThemeState(stored)
    setResolvedTheme(resolved)
    applyTheme(resolved, false)

    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onSystemChange = () => {
      setThemeState((current) => {
        if (current !== "system") return current
        const nextResolved = getSystemTheme()
        setResolvedTheme(nextResolved)
        applyTheme(nextResolved, disableTransitionOnChange)
        return current
      })
    }

    media.addEventListener("change", onSystemChange)
    return () => media.removeEventListener("change", onSystemChange)
  }, [defaultTheme, disableTransitionOnChange, enableSystem, storageKey])

  const setTheme = useCallback(
    (nextTheme: Theme) => {
      if (nextTheme === "system" && !enableSystem) return

      try {
        localStorage.setItem(storageKey, nextTheme)
      } catch {
        // localStorage may be unavailable
      }

      const resolved = resolveTheme(nextTheme)
      setThemeState(nextTheme)
      setResolvedTheme(resolved)
      applyTheme(resolved, disableTransitionOnChange)
    },
    [disableTransitionOnChange, enableSystem, storageKey]
  )

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [resolvedTheme, setTheme, theme]
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
