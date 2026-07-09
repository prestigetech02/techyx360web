import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { CourseRegistration } from "@/components/trainings/course-registration"
import { brand, siteMetadata } from "@/config/brand"
import { findCourseByKey, getCourseKey } from "@/config/training-schools"
import { createPageMetadata } from "@/lib/seo"

const bgImage = "/mobile.jpg"

type CourseRegistrationDetailPageProps = {
  params: Promise<{
    schoolSlug: string
    courseSlug: string
  }>
}

export async function generateStaticParams() {
  const { trainingSchools } = await import("@/config/training-schools")

  return trainingSchools.flatMap((school) =>
    school.courses.map((course) => ({
      schoolSlug: school.id,
      courseSlug: course.slug,
    }))
  )
}

export async function generateMetadata({
  params,
}: CourseRegistrationDetailPageProps): Promise<Metadata> {
  const { schoolSlug, courseSlug } = await params
  const selection = findCourseByKey(getCourseKey(schoolSlug, courseSlug))

  if (!selection) {
    return createPageMetadata({
      title: `Register for a program | ${brand.name}`,
      description:
        "Browse Techyx360 training courses and register for individual certification programs.",
      path: "/trainings/register",
    })
  }

  const { course, school } = selection

  return createPageMetadata({
    title: `Register for ${course.title} | ${brand.name}`,
    description: `Register for ${course.title} at ${school.name}. ${course.description}`,
    path: `/trainings/register/${schoolSlug}/${courseSlug}`,
    keywords: [
      course.title,
      school.name,
      "course registration",
      "tech training enrollment Nigeria",
      ...siteMetadata.keywords.slice(0, 4),
    ],
  })
}

export default async function CourseRegistrationDetailPage({
  params,
}: CourseRegistrationDetailPageProps) {
  const { schoolSlug, courseSlug } = await params
  const selection = findCourseByKey(getCourseKey(schoolSlug, courseSlug))

  if (!selection) notFound()

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
            Register for {selection.course.title}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
            {selection.school.name} · Explore program details and submit your
            registration below.
          </p>
        </div>
      </section>

      <section className="bg-background py-12 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <div className="min-h-[480px] animate-pulse rounded-2xl bg-muted/40" />
            }
          >
            <CourseRegistration />
          </Suspense>
        </div>
      </section>
    </main>
  )
}
