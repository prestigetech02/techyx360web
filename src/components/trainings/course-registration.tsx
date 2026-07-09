"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Clock, Download, Minus, Plus } from "lucide-react"

import { RegisterCourseForm } from "@/components/trainings/register-course-form"
import { Badge } from "@/components/ui/badge"
import {
  findCourseByKey,
  getCourseKey,
  getCoursePath,
  getDefaultCourseKey,
  parseCourseKeyFromPath,
  trainingSchools,
} from "@/config/training-schools"
import { cn } from "@/lib/utils"

const defaultCourseKey = getDefaultCourseKey()

export function CourseRegistration() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [submitted, setSubmitted] = useState(false)

  const legacyCourseParam = searchParams.get("course")
  const pathCourseKey = parseCourseKeyFromPath(pathname)
  const activeKey =
    (pathCourseKey && findCourseByKey(pathCourseKey) && pathCourseKey) ||
    (legacyCourseParam && findCourseByKey(legacyCourseParam) && legacyCourseParam) ||
    defaultCourseKey

  const selection = findCourseByKey(activeKey)

  const [openSchools, setOpenSchools] = useState<Set<string>>(() =>
    selection ? new Set([selection.school.id]) : new Set()
  )

  useEffect(() => {
    if (legacyCourseParam) {
      const resolved = findCourseByKey(legacyCourseParam)

      if (resolved) {
        router.replace(
          getCoursePath(resolved.school.id, resolved.course.slug)
        )
        return
      }

      router.replace(getCoursePath(trainingSchools[0].id, trainingSchools[0].courses[0].slug))
    }
  }, [legacyCourseParam, router])

  useEffect(() => {
    if (!selection?.school.id) return

    setOpenSchools(new Set([selection.school.id]))
  }, [selection?.school.id])

  if (!selection) return null

  const { school, course } = selection
  const CourseIcon = course.icon

  const toggleSchool = (schoolId: string) => {
    setOpenSchools((current) => {
      const next = new Set(current)
      if (next.has(schoolId)) {
        next.delete(schoolId)
      } else {
        next.add(schoolId)
      }
      return next
    })
  }

  const selectCourse = (key: string) => {
    setSubmitted(false)
    const resolved = findCourseByKey(key)
    if (!resolved) return

    router.push(getCoursePath(resolved.school.id, resolved.course.slug), {
      scroll: false,
    })
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(260px,300px)_1fr] lg:gap-10">
      <aside className="order-2 min-w-0 lg:order-1 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5">
          <h2 className="text-base font-semibold text-foreground">
            Our courses
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse programs and read more before you register.
          </p>

          <div className="mt-5 divide-y divide-border/60">
            {trainingSchools.map((schoolItem) => {
              const isOpen = openSchools.has(schoolItem.id)
              const hasActiveCourse = schoolItem.courses.some(
                (courseItem) =>
                  getCourseKey(schoolItem.id, courseItem) === activeKey
              )

              return (
                <div key={schoolItem.id}>
                  <button
                    type="button"
                    onClick={() => toggleSchool(schoolItem.id)}
                    className="group -mx-1 flex w-full items-center justify-between gap-3 rounded-lg px-1 py-3.5 text-left transition-all duration-300 hover:bg-muted/40"
                    aria-expanded={isOpen}
                  >
                    <span
                      className={cn(
                        "text-sm font-semibold leading-snug text-foreground",
                        hasActiveCourse && "text-brand"
                      )}
                    >
                      {schoolItem.name}
                    </span>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-brand transition-all duration-300 group-hover:bg-brand/10 group-hover:scale-105">
                      {isOpen ? (
                        <Minus className="size-4" aria-hidden />
                      ) : (
                        <Plus className="size-4" aria-hidden />
                      )}
                    </span>
                  </button>

                  {isOpen && (
                    <ul className="space-y-2 pb-4">
                      {schoolItem.courses.map((courseItem) => {
                        const key = getCourseKey(schoolItem.id, courseItem)
                        const isActive = key === activeKey

                        return (
                          <li key={key}>
                            <button
                              type="button"
                              onClick={() => selectCourse(key)}
                              className={cn(
                                "w-full rounded-xl border px-3.5 py-3 text-left text-sm transition-all duration-300 active:scale-[0.99]",
                                isActive
                                  ? "border-brand/50 bg-brand/10 text-brand"
                                  : "border-border/60 bg-background text-foreground hover:scale-[1.01] hover:border-brand/30 hover:bg-brand/5"
                              )}
                            >
                              <span className="font-semibold">
                                {courseItem.title}
                              </span>
                              <span
                                className={cn(
                                  "mt-1 block text-xs",
                                  isActive
                                    ? "text-brand/80"
                                    : "text-muted-foreground"
                                )}
                              >
                                {courseItem.duration}
                              </span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </aside>

      <div className="order-1 min-w-0 space-y-6 lg:order-2">
        <article className="overflow-hidden rounded-2xl border border-border/60 bg-card">
          <div className="relative aspect-[21/9] w-full">
            <Image
              src={school.image}
              alt={school.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 760px"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
          </div>

          <div className="p-6 sm:p-8">
            <Badge
              variant="outline"
              className="rounded-full border-brand/30 bg-brand/10 text-[0.65rem] font-semibold tracking-[0.16em] text-brand uppercase"
            >
              {school.name}
            </Badge>

            <div className="mt-4 flex items-start gap-4">
              <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand">
                <CourseIcon className="size-5" aria-hidden />
              </span>

              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                  {course.title}
                </h2>
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[#eaaa33]">
                  <Clock className="size-4" aria-hidden />
                  Duration: {course.duration}
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {course.description}
            </p>

            <a
              href="/techyx360-training-brochure.pdf"
              download="Techyx360-Training-Brochure.pdf"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#eaaa33] px-6 text-sm font-semibold text-[#1a1408] transition-all duration-300 hover:scale-[1.02] hover:brightness-95 active:scale-[0.98]"
            >
              <Download className="size-4" aria-hidden />
              Download brochure
            </a>
          </div>
        </article>

        <section className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
          {submitted ? (
            <div className="py-6 text-center">
              <h3 className="text-xl font-semibold text-foreground">
                Registration received
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                Thank you for your interest in {course.title}. Our team will
                contact you with enrollment details and next steps.
              </p>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-semibold text-foreground">
                Register for this course
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Complete the form below and we&apos;ll get you started on your
                learning journey.
              </p>

              <div className="mt-6">
                <RegisterCourseForm
                  schoolId={school.id}
                  courseSlug={course.slug}
                  courseTitle={course.title}
                  schoolName={school.name}
                  onSuccess={() => setSubmitted(true)}
                />
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
