import type { ReactNode } from "react"

import { PageHeroBackground } from "@/components/layout/page-hero-background"
import { cn } from "@/lib/utils"

type PageHeroBannerProps = {
  title: string
  children?: ReactNode
  className?: string
}

/**
 * Lightweight page hero — decorative CSS/SVG background without a photo asset.
 */
export function PageHeroBanner({
  title,
  children,
  className,
}: PageHeroBannerProps) {
  return (
    <section
      className={cn("relative overflow-hidden bg-[#0b2c66]", className)}
    >
      <PageHeroBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        {children}
      </div>
    </section>
  )
}
