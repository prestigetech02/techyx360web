import type { ReactNode } from "react"

type PageHeroBannerProps = {
  title: string
  children?: ReactNode
  className?: string
}

/**
 * Lightweight page hero — CSS pattern instead of a background image
 * to avoid loading decorative assets on every inner page.
 */
export function PageHeroBanner({
  title,
  children,
  className,
}: PageHeroBannerProps) {
  return (
    <section
      className={`relative overflow-hidden bg-[#0b2c66] ${className ?? ""}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.18) 1.5px, transparent 1.5px)",
          backgroundSize: "14px 14px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0b2c66] via-[#0b2c66]/95 to-[#123d8a]/80"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        {children}
      </div>
    </section>
  )
}
