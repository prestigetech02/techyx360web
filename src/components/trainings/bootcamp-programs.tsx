import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Clock } from "lucide-react"

import { BootcampAccordionRow } from "@/components/trainings/bootcamp-accordion-row"
import { Badge } from "@/components/ui/badge"
import { bootcampPrograms } from "@/config/bootcamps"

const popularBootcamps = bootcampPrograms.slice(0, 4)

export function BootcampPrograms() {
  return (
    <section
      id="upcoming-bootcamps"
      className="scroll-mt-24 bg-background py-14 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <Badge
            variant="outline"
            className="mb-4 rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
          >
            Popular Bootcamps
          </Badge>

          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl dark:text-foreground">
            Explore Our Short-Term Programs
          </h2>
        </div>

        <div className="mt-10">
          <BootcampAccordionRow programs={popularBootcamps} />
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:hidden">
          {popularBootcamps.map((program) => (
            <article
              key={program.title}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:border-brand/30 hover:shadow-md"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                  src={program.image}
                  alt={program.imageAlt}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              </div>

              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-foreground">
                  {program.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {program.description}
                </p>

                <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#eaaa33]">
                  <Clock className="size-4 shrink-0" aria-hidden />
                  Duration: {program.duration}
                </p>

                <Link
                  href={program.href}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-[#eaaa33]"
                >
                  Learn more
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
