import Image from "next/image"
import { QuoteIcon, StarIcon } from "lucide-react"

import type { Testimonial } from "@/config/testimonials"
import { cn } from "@/lib/utils"

type TestimonialCardProps = {
  testimonial: Testimonial
  className?: string
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5" aria-hidden>
        {Array.from({ length: 5 }).map((_, index) => (
          <StarIcon
            key={index}
            className={cn(
              "size-4",
              index < Math.floor(rating)
                ? "fill-[#eaaa33] text-[#eaaa33]"
                : index < rating
                  ? "fill-[#eaaa33]/50 text-[#eaaa33]"
                  : "fill-transparent text-white/25"
            )}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-white">{rating.toFixed(1)}</span>
    </div>
  )
}

export function TestimonialCard({ testimonial, className }: TestimonialCardProps) {
  return (
    <article
      data-card
      className={cn(
        "flex h-full min-w-[min(100%,320px)] flex-[0_0_100%] snap-start flex-col rounded-2xl bg-[#161f33] p-6 sm:min-w-[calc(50%-12px)] sm:flex-[0_0_calc(50%-12px)] lg:min-w-[calc(33.333%-16px)] lg:flex-[0_0_calc(33.333%-16px)]",
        className
      )}
    >
      <StarRating rating={testimonial.rating} />

      <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-white/90 italic sm:text-base">
        {testimonial.quote}
      </blockquote>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative size-11 shrink-0 overflow-hidden rounded-full">
            <Image
              src={testimonial.image}
              alt={testimonial.name}
              fill
              className="object-cover"
              sizes="44px"
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white sm:text-base">
              {testimonial.name}
            </p>
            <p className="truncate text-xs text-white/55 sm:text-sm">
              {testimonial.role}
            </p>
          </div>
        </div>

        <QuoteIcon
          aria-hidden
          className="size-10 shrink-0 text-white/15 sm:size-12"
        />
      </div>
    </article>
  )
}
