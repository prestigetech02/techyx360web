"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useState } from "react"

import type { BootcampProgram } from "@/config/bootcamps"
import { cn } from "@/lib/utils"

type BootcampAccordionRowProps = {
  programs: BootcampProgram[]
  className?: string
}

export function BootcampAccordionRow({
  programs,
  className,
}: BootcampAccordionRowProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  return (
    <div
      onMouseLeave={() => setActiveIndex(null)}
      className={cn(
        "hidden h-[380px] gap-3 lg:flex lg:h-[420px] xl:h-[460px]",
        className
      )}
    >
      {programs.map((program, index) => {
        const isActive = activeIndex === index

        return (
          <article
            key={program.title}
            onMouseEnter={() => setActiveIndex(index)}
            className={cn(
              "relative min-w-0 overflow-hidden rounded-2xl transition-[flex] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
              isActive ? "flex-[2]" : "flex-1"
            )}
          >
            <Image
              src={program.image}
              alt={program.imageAlt}
              fill
              sizes="(max-width: 1280px) 40vw, 25vw"
              className={cn(
                "object-cover transition-transform duration-700 ease-out",
                isActive ? "scale-105" : "scale-100"
              )}
            />

            <div
              className={cn(
                "absolute inset-0 transition-colors duration-500",
                isActive
                  ? "bg-gradient-to-t from-black/80 via-black/35 to-black/15"
                  : "bg-gradient-to-t from-black/70 via-black/25 to-black/10"
              )}
            />

            <div
              className={cn(
                "absolute inset-0 flex items-end p-5 transition-all duration-500 ease-out",
                isActive
                  ? "pointer-events-none translate-y-2 opacity-0"
                  : "translate-y-0 opacity-100"
              )}
            >
              <h3 className="max-h-[88%] text-sm font-bold tracking-wide text-white [writing-mode:vertical-rl] rotate-180 xl:text-base">
                {program.title}
              </h3>
            </div>

            <div
              className={cn(
                "absolute inset-x-0 bottom-0 flex items-end gap-4 p-5 transition-all duration-500 ease-out sm:gap-5 sm:p-6",
                isActive
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-3 opacity-0"
              )}
            >
              <Link
                href={program.href}
                aria-label={`Learn more about ${program.title}`}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-brand shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-white/95 sm:size-12"
              >
                <ArrowRight className="size-5" aria-hidden />
              </Link>

              <div className="min-w-0 pb-1">
                <h3 className="text-lg font-bold leading-tight text-white sm:text-xl lg:text-2xl">
                  {program.title}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/85 sm:text-[0.95rem]">
                  {program.description}
                </p>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
