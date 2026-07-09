"use client"

import { ChevronUpIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

const BUTTON_SIZE = 52
const STROKE_WIDTH = 3
const RADIUS = (BUTTON_SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

type BackToTopProps = {
  className?: string
}

export function BackToTop({ className }: BackToTopProps) {
  const [mounted, setMounted] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setMounted(true)

    const updateProgress = () => {
      const scrollTop = window.scrollY
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight

      if (scrollableHeight <= 0) {
        setProgress(0)
        return
      }

      setProgress(Math.min(100, (scrollTop / scrollableHeight) * 100))
    }

    updateProgress()
    window.addEventListener("scroll", updateProgress, { passive: true })
    window.addEventListener("resize", updateProgress)

    return () => {
      window.removeEventListener("scroll", updateProgress)
      window.removeEventListener("resize", updateProgress)
    }
  }, [])

  if (!mounted) return null

  const strokeOffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE

  return createPortal(
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed right-5 bottom-5 z-[9999] inline-flex size-[52px] items-center justify-center sm:right-6 sm:bottom-6",
        className
      )}
    >
      <svg
        aria-hidden
        width={BUTTON_SIZE}
        height={BUTTON_SIZE}
        viewBox={`0 0 ${BUTTON_SIZE} ${BUTTON_SIZE}`}
        className="absolute inset-0 -rotate-90"
      >
        <circle
          cx={BUTTON_SIZE / 2}
          cy={BUTTON_SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH}
          className="text-white/15"
        />
        <circle
          cx={BUTTON_SIZE / 2}
          cy={BUTTON_SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeOffset}
          className="text-[#eaaa33] transition-[stroke-dashoffset] duration-150"
        />
      </svg>

      <span className="relative flex size-10 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-lg shadow-black/25 transition-colors hover:bg-brand/90">
        <ChevronUpIcon className="size-5" />
      </span>
    </button>,
    document.body
  )
}
