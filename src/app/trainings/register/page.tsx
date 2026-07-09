import type { Metadata } from "next"
import Image from "next/image"
import { Suspense } from "react"

import { CourseRegistration } from "@/components/trainings/course-registration"
import { brand, siteMetadata } from "@/config/brand"
import { createPageMetadata } from "@/lib/seo"

const bgImage = "/mobile.jpg"

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
      <section className="relative overflow-hidden">
        <Image
          src={bgImage}
          alt=""
          aria-hidden
          fill
          priority
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-[#0b2c66]/90" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Register for a program
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
            Explore our programs, read course details, and submit your
            registration in one place.
          </p>
        </div>
      </section>

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
