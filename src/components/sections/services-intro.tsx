"use client"

import { Badge } from "@/components/ui/badge"
import { BrandCtaButton } from "@/components/ui/brand-cta-button"

export function ServicesIntro() {
  return (
    <section id="services" className="relative">
      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 md:pb-12 lg:px-8">
        <div className="flex flex-col gap-8 rounded-3xl border border-border/60 bg-background/30 p-6 backdrop-blur-sm sm:p-8 md:flex-row md:items-end md:justify-between lg:p-10">
          <div className="max-w-3xl">
            <Badge
              variant="outline"
              className="mb-4 rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
            >
              Our Services
            </Badge>

            <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
              End-to-end IT services for businesses in Nigeria
            </h2>

            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              From software development and web design to mobile apps, IT
              consulting, and digital marketing, Techyx360 delivers scalable
              technology solutions that help Nigerian businesses compete and
              grow online.
            </p>
          </div>

          <BrandCtaButton
            href="/services"
            className="w-full sm:w-auto sm:px-7 md:h-12"
          >
            Our Services
          </BrandCtaButton>
        </div>
      </div>
    </section>
  )
}
