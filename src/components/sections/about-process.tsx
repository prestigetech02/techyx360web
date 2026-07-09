 "use client"

import Image from "next/image"
import type { LucideIcon } from "lucide-react"
import { ChevronRightIcon } from "lucide-react"
import { motion } from "framer-motion"

import { Badge } from "@/components/ui/badge"
import { aboutProcessSteps } from "@/config/about-process"

type StepCardProps = {
  title: string
  icon: LucideIcon
  stepNumber: string
  delay: number
}

function StepCard({
  title,
  icon: Icon,
  stepNumber,
  delay,
}: StepCardProps) {
  return (
    <motion.article
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-6 text-center transition-colors duration-300"
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay }}
    >
      {/* Diagonal light-rays flash on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        <div className="absolute inset-0 -translate-x-full rotate-12 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)] transition-transform duration-700 group-hover:translate-x-full" />
      </div>

      <span
        aria-hidden
        className="pointer-events-none absolute right-5 top-4 z-0 text-4xl font-extrabold tracking-tight text-brand opacity-[0.07] dark:text-brand dark:opacity-[0.1] sm:right-6"
      >
        {stepNumber}
      </span>

      <div className="relative z-10 mx-auto inline-flex size-12 items-center justify-center rounded-full bg-brand text-brand-foreground">
        <Icon className="size-5" aria-hidden />
      </div>

      <h3 className="relative z-10 mt-4 text-xl font-bold tracking-tight text-brand">
        {title}
      </h3>
    </motion.article>
  )
}

export function AboutProcess() {
  return (
    <section className="bg-[#f4f6fa] py-16 dark:bg-[#0f1524] sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[2fr_3fr] lg:items-center">
          <motion.div
            className="relative h-[320px] w-full overflow-hidden rounded-3xl sm:h-[380px] lg:h-[440px]"
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65, delay: 0.04 }}
          >
            <Image
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80"
              alt="Team collaboration and IT project workflow"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-sm">
                <span className="size-2 rounded-full bg-[#eaaa33]" aria-hidden />
                Our Process
                <ChevronRightIcon className="size-4" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65, delay: 0.14 }}
          >
            <Badge
              variant="outline"
              className="mb-4 rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
            >
              Our Process
            </Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              A clear delivery path from idea to results
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Techyx360&apos;s process is built to deliver reliable IT solutions for
              your business
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {aboutProcessSteps.map((step, index) => (
                <StepCard
                  key={step.id}
                  title={step.title}
                  icon={step.icon}
                  stepNumber={String(index + 1).padStart(2, "0")}
                  delay={0.22 + index * 0.12}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

