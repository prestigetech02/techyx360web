import type { Metadata } from "next"
import Image from "next/image"

import { CareersHighlights } from "@/components/careers/careers-highlights"
import {
  JoinTalentPoolDialogButton,
  JoinTalentPoolDialogProvider,
} from "@/components/careers/join-talent-pool-dialog"
import { OpenPositionsSection } from "@/components/careers/open-positions"
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld"
import { JsonLd } from "@/components/seo/json-ld"
import { BrandCtaButton } from "@/components/ui/brand-cta-button"
import { brand, siteMetadata } from "@/config/brand"
import { getOpenJobOpenings } from "@/lib/careers/openings"
import { getCareersListingStructuredData } from "@/lib/careers/seo"
import { createPageMetadata } from "@/lib/seo"

export const revalidate = 60

export const metadata: Metadata = createPageMetadata({
  title: `Careers at ${brand.name} | Tech Jobs in Lagos & Remote Nigeria`,
  description:
    "Explore open tech roles at Techyx360 — engineering, product, design, and support. Join a Nigeria-based team building software and digital products across Africa.",
  path: "/careers",
  ogImage: "/careers-hero.png",
  ogImageAlt:
    "Techyx360 team members collaborating in the office at careers page",
  keywords: [
    "Techyx360 careers",
    "tech jobs Lagos",
    "software developer jobs Nigeria",
    "IT jobs Lagos",
    "remote tech jobs Nigeria",
    "product manager jobs Nigeria",
    "UI UX designer jobs Lagos",
    ...siteMetadata.keywords.slice(0, 4),
  ],
})

export default async function CareersPage() {
  const openPositions = await getOpenJobOpenings()

  return (
    <JoinTalentPoolDialogProvider>
      <main className="flex flex-1 flex-col">
        <BreadcrumbJsonLd
          items={[
            { name: "Home", path: "/" },
            { name: "Careers", path: "/careers" },
          ]}
        />
        <JsonLd data={getCareersListingStructuredData(openPositions)} />

        <section className="relative isolate overflow-hidden bg-[#0f1524]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
          >
            <Image
              src="/careers-hero.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_30%] sm:object-[70%_center] lg:object-right"
            />
            <div className="absolute inset-0 bg-[#0f1524]/90 sm:bg-[#0f1524]/80 lg:bg-transparent lg:bg-gradient-to-r lg:from-[#0f1524] lg:from-0% lg:via-[#0f1524] lg:via-40% lg:to-transparent lg:to-78%" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1524]/70 via-transparent to-[#0f1524]/40 lg:hidden" />
          </div>

          <div className="relative z-10 mx-auto grid min-h-[34rem] max-w-7xl grid-cols-1 items-center px-4 py-16 sm:min-h-[38rem] sm:px-6 sm:py-20 lg:min-h-[42rem] lg:grid-cols-2 lg:px-8 lg:py-24">
            <div className="max-w-xl">
              <p className="text-xs font-semibold tracking-[0.22em] text-brand uppercase sm:text-sm">
                Careers at Techyx360
              </p>

              <h1 className="mt-4 text-4xl font-bold tracking-tight text-balance text-white sm:text-5xl lg:text-6xl">
                Build Your Career.
                <span className="mt-1 block text-[#eaaa33]">
                  Build the Future.
                </span>
              </h1>

              <p className="mt-5 max-w-md text-base leading-relaxed text-white/85 sm:text-lg">
                Join a team of innovators, builders, and problem-solvers
                dedicated to creating technology that makes impact.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <BrandCtaButton href="#open-positions">
                  View Open Positions
                </BrandCtaButton>

                <JoinTalentPoolDialogButton variant="hero" />
              </div>
            </div>

            <div className="hidden lg:block" aria-hidden />
          </div>
        </section>

        <CareersHighlights />

        <OpenPositionsSection positions={openPositions} />
      </main>
    </JoinTalentPoolDialogProvider>
  )
}
