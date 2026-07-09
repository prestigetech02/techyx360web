 "use client"

import Image from "next/image"
import { motion } from "framer-motion"

import { aboutPrinciples } from "@/config/about"
import { cn } from "@/lib/utils"

export function AboutPrinciples() {
  return (
    <section className="relative overflow-hidden bg-background py-14 sm:py-16 lg:py-20">
      <Image
        src="/hero-element.svg"
        alt=""
        aria-hidden
        width={360}
        height={360}
        className="pointer-events-none absolute -top-10 -left-20 z-0 h-56 w-56 select-none object-contain opacity-[0.35] sm:-top-14 sm:-left-24 sm:h-64 sm:w-64 lg:-top-8 lg:-left-28 lg:h-72 lg:w-72 dark:opacity-[0.5]"
      />
      <Image
        src="/hero-element.svg"
        alt=""
        aria-hidden
        width={360}
        height={360}
        className="pointer-events-none absolute -top-10 -right-20 z-0 h-56 w-56 select-none scale-x-[-1] object-contain opacity-[0.3] sm:-top-14 sm:-right-24 sm:h-64 sm:w-64 lg:-top-8 lg:-right-28 lg:h-72 lg:w-72 dark:opacity-[0.45]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {aboutPrinciples.map((item, index) => {
            const Icon = item.icon

            return (
              <motion.article
                key={item.id}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-7"
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6, delay: index * 0.12 }}
              >
                {/* Diagonal light-rays flash on hover */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                >
                  <div className="absolute inset-0 -translate-x-full rotate-12 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)] transition-transform duration-700 group-hover:translate-x-full" />
                </div>

                <div
                  className={cn(
                    "relative z-10 inline-flex size-12 items-center justify-center rounded-xl",
                    "border border-brand/15 bg-brand/10 text-brand"
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </div>

                <h2 className="relative z-10 mt-5 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {item.title}
                </h2>

                <p className="relative z-10 mt-3 flex-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {item.description}
                </p>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
