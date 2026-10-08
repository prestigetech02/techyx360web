"use client"

import { useServerInsertedHTML } from "next/navigation"
import { useEffect, type ReactNode } from "react"

import { useTheme } from "@/components/providers/theme-provider"

function applyLight() {
  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add("light")
  root.style.colorScheme = "light"
}

const FORCE_LIGHT_SCRIPT = `(function(){try{var r=document.documentElement;r.classList.remove('dark');r.classList.add('light');r.style.colorScheme='light'}catch(e){}})();`

export function PifForceLightTheme({ children }: { children: ReactNode }) {
  const { setTheme } = useTheme()

  useServerInsertedHTML(() => (
    <script dangerouslySetInnerHTML={{ __html: FORCE_LIGHT_SCRIPT }} />
  ))

  useEffect(() => {
    let previousTheme: "light" | "dark" | "system" = "dark"
    try {
      const stored = localStorage.getItem("theme")
      if (stored === "light" || stored === "dark" || stored === "system") {
        previousTheme = stored
      }
    } catch {
      // ignore
    }

    applyLight()

    const observer = new MutationObserver(() => {
      if (!document.documentElement.classList.contains("light")) {
        applyLight()
      }
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => {
      observer.disconnect()
      setTheme(previousTheme)
    }
  }, [setTheme])

  return children
}
