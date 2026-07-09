"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useRef } from "react"

import { TestimonialCard } from "@/components/cards/testimonial-card"
import { Badge } from "@/components/ui/badge"
import { testimonials } from "@/config/testimonials"
import { cn } from "@/lib/utils"

function CarouselButton({
  direction,
  onClick,
  className,
}: {
  direction: "left" | "right"
  onClick: () => void
  className?: string
}) {
  const Icon = direction === "left" ? ChevronLeftIcon : ChevronRightIcon

  return (
    <button
      type="button"
      aria-label={direction === "left" ? "Previous testimonial" : "Next testimonial"}
      onClick={onClick}
      className={cn(
        "absolute top-1/2 z-10 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/80 text-zinc-900 shadow-lg backdrop-blur-sm transition-colors hover:bg-white",
        className
      )}
    >
      <Icon className="size-5" />
    </button>
  )
}

export function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current
    if (!container) return

    const card = container.querySelector<HTMLElement>("[data-card]")
    const gap = 24
    const amount = (card?.offsetWidth ?? 320) + gap

    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    })
  }

  return (
    <section
      id="testimonials"
      className="relative bg-[#0d1424] py-16 text-white sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
          <Badge
            variant="outline"
            className="mb-4 rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
          >
            Testimonials
          </Badge>

          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            What our clients say about Techyx360
          </h2>

          <p className="mt-4 text-base text-white/60 sm:text-lg">
            Trusted by businesses across Nigeria for reliable IT solutions and
            long-term partnership.
          </p>
        </div>

        <div className="relative">
          <CarouselButton
            direction="left"
            onClick={() => scroll("left")}
            className="left-0 -translate-x-1/2 max-sm:hidden"
          />
          <CarouselButton
            direction="right"
            onClick={() => scroll("right")}
            className="right-0 translate-x-1/2 max-sm:hidden"
          />

          <div
            ref={scrollRef}
            className="testimonials-track flex gap-6 overflow-x-auto scroll-smooth px-1 py-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-2 [&::-webkit-scrollbar]:hidden"
          >
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>

          <div className="mt-6 flex justify-center gap-3 sm:hidden">
            <CarouselButton
              direction="left"
              onClick={() => scroll("left")}
              className="static translate-x-0 translate-y-0"
            />
            <CarouselButton
              direction="right"
              onClick={() => scroll("right")}
              className="static translate-x-0 translate-y-0"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
