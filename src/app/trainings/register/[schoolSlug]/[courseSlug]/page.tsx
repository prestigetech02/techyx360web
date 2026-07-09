import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { PageHeroBanner } from "@/components/layout/page-hero-banner"
import { CourseRegistration } from "@/components/trainings/course-registration"
import { brand, siteMetadata } from "@/config/brand"
import { findCourseByKey, getCourseKey } from "@/config/training-schools"
import { createPageMetadata } from "@/lib/seo"

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
    ogImage: school.image,
    ogImageAlt: school.imageAlt,
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
      <PageHeroBanner title={`Register for ${selection.course.title}`}>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
          {selection.school.name} · Explore program details and submit your
          registration below.
        </p>
      </PageHeroBanner>

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
