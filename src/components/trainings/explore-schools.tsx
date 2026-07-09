"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { trainingSchools } from "@/config/training-schools"
import { cn } from "@/lib/utils"

function SchoolStackCard({
  name,
  image,
  imageAlt,
  isActive,
  onClick,
}: {
  name: string
  image: string
  imageAlt: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        "group relative w-full min-h-0 overflow-hidden rounded-[1.25rem] border text-left transition-all duration-500 ease-out",
        isActive
          ? "aspect-square border-brand/40 shadow-[0_20px_50px_rgba(0,0,0,0.35)] lg:aspect-auto lg:flex-[2.5]"
          : "aspect-[2.4/1] border-white/10 hover:border-white/25 lg:aspect-auto lg:flex-1"
      )}
    >
      <Image
        src={image}
        alt={imageAlt}
        fill
        sizes="(max-width: 1024px) 100vw, 360px"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <div
        className={cn(
          "absolute inset-0 transition-colors duration-500",
          isActive
            ? "bg-gradient-to-t from-black/75 via-black/35 to-black/10"
            : "bg-black/50 group-hover:bg-black/40"
        )}
      />

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <p
          className={cn(
            "font-semibold leading-snug text-white transition-all duration-500",
            isActive ? "text-base sm:text-lg" : "text-sm sm:text-base"
          )}
        >
          {name}
        </p>
      </div>
    </button>
  )
}

export function ExploreSchools() {
  const [activeIndex, setActiveIndex] = useState(0)
  const contentRef = useRef<HTMLElement>(null)
  const [contentHeight, setContentHeight] = useState<number | null>(null)
  const [isLargeScreen, setIsLargeScreen] = useState(false)
  const school = trainingSchools[activeIndex]

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)")
    const updateScreen = () => setIsLargeScreen(mediaQuery.matches)

    updateScreen()
    mediaQuery.addEventListener("change", updateScreen)

    return () => mediaQuery.removeEventListener("change", updateScreen)
  }, [])

  useEffect(() => {
    const node = contentRef.current
    if (!node) return

    const updateHeight = () => {
      setContentHeight(node.getBoundingClientRect().height)
    }

    updateHeight()

    const observer = new ResizeObserver(updateHeight)
    observer.observe(node)

    return () => observer.disconnect()
  }, [activeIndex])

  return (
    <section className="bg-[#0d1424] py-16 text-white sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            Explore our schools
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(280px,360px)_1fr] lg:items-start lg:gap-5">
          <div
            className="flex flex-col gap-3 lg:min-h-0"
            style={
              isLargeScreen && contentHeight !== null
                ? {
                    height: `${contentHeight}px`,
                    maxHeight: `${contentHeight}px`,
                  }
                : undefined
            }
          >
            {trainingSchools.map((item, index) => (
              <SchoolStackCard
                key={item.id}
                name={item.name}
                image={item.image}
                imageAlt={item.imageAlt}
                isActive={index === activeIndex}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>

          <article
            ref={contentRef}
            className="rounded-[1.75rem] border border-white/10 bg-[#151d31] p-6 sm:p-8 lg:p-10"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {school.name}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
                {school.description}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {school.courses.map((course) => {
                const Icon = course.icon

                return (
                  <div key={course.title}>
                    <div className="flex items-start gap-4">
                      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand">
                        <Icon className="size-5" aria-hidden />
                      </span>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-lg font-semibold text-white">
                          {course.title}
                        </h4>
                        <p className="mt-2 text-sm leading-relaxed text-white/65 sm:text-base">
                          {course.description}
                        </p>
                        <p className="mt-3 text-sm font-medium text-[#eaaa33]">
                          Duration: {course.duration}
                        </p>
                        {course.detailPath ? (
                          <Link
                            href={course.detailPath}
                            className="group/link mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-white/80 transition-colors duration-300 hover:text-[#eaaa33]"
                          >
                            View detail
                            <ArrowRight
                              className="size-3.5 transition-transform duration-300 group-hover/link:translate-x-0.5"
                              aria-hidden
                            />
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
