"use client"

import { Badge } from "@/components/ui/badge"
import { BrandCtaButton } from "@/components/ui/brand-cta-button"
import { brand } from "@/config/brand"

export function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-[#eef4ff] py-16 text-center sm:py-20 lg:py-24 dark:bg-[#121a2e]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 hidden opacity-[0.28] dark:block"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.13) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.13) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.95), rgba(0,0,0,0))",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.95), rgba(0,0,0,0))",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-25 dark:hidden"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(15,27,61,0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,27,61,0.16) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.95), rgba(0,0,0,0))",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.95), rgba(0,0,0,0))",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <Badge
            variant="outline"
            className="mb-4 rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
          >
            About Us
          </Badge>

          <h1 className="text-3xl font-bold tracking-tight text-balance text-zinc-900 sm:text-4xl lg:text-5xl dark:text-foreground">
            Welcome to {brand.name}
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-muted-foreground">
            At {brand.name.toUpperCase()}, we&apos;re not just another technology
            solutions provider – we are architects of innovation, builders of
            digital dreams, and partners in your journey towards business
            excellence.
          </p>

          <BrandCtaButton href="/services" className="mt-8 px-7 md:h-12">
            See All Services
          </BrandCtaButton>
        </div>
      </div>
    </section>
  )
}
