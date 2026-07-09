import type { Metadata } from "next"
import { Suspense } from "react"

import { PageHeroBanner } from "@/components/layout/page-hero-banner"
import { CourseRegistration } from "@/components/trainings/course-registration"
import { brand, siteMetadata } from "@/config/brand"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: `Register for a program | ${brand.name}`,
  description:
    "Browse Techyx360 training courses, read program details, and register for individual certification programs in software engineering, product, and business.",
  path: "/trainings/register",
  keywords: [
    "course registration",
    "tech training enrollment Nigeria",
    "individual certification registration",
    ...siteMetadata.keywords.slice(0, 5),
  ],
})

export default function CourseRegistrationPage() {
  return (
    <main className="flex flex-1 flex-col">
      <PageHeroBanner title="Register for a program">
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
          Explore our programs, read course details, and submit your registration
          in one place.
        </p>
      </PageHeroBanner>

      <section className="bg-background py-12 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<div className="min-h-[480px] animate-pulse rounded-2xl bg-muted/40" />}>
            <CourseRegistration />
          </Suspense>
        </div>
      </section>
    </main>
  )
}
