"use client"

import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"

import { LogoMarquee } from "@/components/sections/logo-marquee"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const whyChooseItems = [
  {
    value: "custom-solutions",
    title: "Custom Solutions",
    content:
      "Every business is unique. We develop solutions tailored to your specific goals and challenges.",
  },
  {
    value: "expert-team",
    title: "Expert Team",
    content:
      "Our experienced professionals deliver reliable technology solutions using industry best practices.",
  },
  {
    value: "ongoing-support",
    title: "Ongoing Support",
    content:
      "From deployment to maintenance, we're committed to your long-term success.",
  },
]

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1600&q=80",
    title: "Digital Transformation",
    subtitle: "Software, Web & Mobile",
  },
  {
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80",
    title: "IT Consulting",
    subtitle: "Strategy & Implementation",
  },
  {
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80",
    title: "Business Growth",
    subtitle: "Development, Marketing",
  },
]

function WhyChooseAccordion() {
  const [openItems, setOpenItems] = useState<string[]>(["custom-solutions"])

  return (
    <Accordion
      value={openItems}
      onValueChange={setOpenItems}
      keepMounted
      className="w-full gap-0 border-white/15"
    >
      {whyChooseItems.map((item) => (
        <AccordionItem
          key={item.value}
          value={item.value}
          className="border-white/15"
        >
          <AccordionTrigger className="py-3 text-base font-bold text-white hover:no-underline sm:text-lg [&_[data-slot=accordion-trigger-icon]]:text-white/70">
            {item.title}
          </AccordionTrigger>
          <AccordionContent className="pb-3 text-sm leading-relaxed text-white/75 sm:text-base">
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

function WhyChooseSpotlight() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [])

  const slide = slides[index]

  return (
    <div className="mt-10 grid gap-4 sm:mt-12 md:mt-14 md:grid-cols-5 md:gap-5">
      {/* Picture ~60% */}
      <div className="relative min-h-[220px] overflow-hidden rounded-3xl sm:min-h-[240px] md:col-span-3 md:min-h-[300px] lg:min-h-[320px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.image}
            initial={false}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt={`${slide.title} — Techyx360 IT solutions in Nigeria`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
              priority={index === 0}
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 sm:gap-4 sm:p-6 md:p-8">
          <div className="min-w-0">
            <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl">
              {slide.title}
            </h3>
            <p className="mt-1 text-sm text-white/80 sm:text-base">
              {slide.subtitle}
            </p>
          </div>
          <span className="shrink-0 text-xs font-medium text-white/90 sm:text-sm">
            {index + 1} / {slides.length}
          </span>
        </div>
      </div>

      {/* Accordion card ~40% */}
      <div className="relative flex min-h-[220px] flex-col justify-center rounded-3xl bg-gradient-to-br from-brand via-brand to-brand/80 p-6 text-white sm:min-h-[240px] sm:p-7 md:col-span-2 md:min-h-[300px] md:p-8 lg:min-h-[320px]">
        <span
          aria-hidden
          className="absolute top-6 left-6 size-3 rounded-full bg-[#eaaa33] sm:top-7 sm:left-7"
        />

        <WhyChooseAccordion />
      </div>
    </div>
  )
}

export function WhyChoose() {
  return (
    <section
      id="why-choose"
      className="relative bg-[#eef4ff] text-zinc-900 dark:bg-[#121a2e] dark:text-foreground"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Badge
            variant="outline"
            className="mb-4 rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
          >
            Why Choose Techyx360
          </Badge>

          <h2 className="text-3xl font-bold tracking-tight text-balance text-zinc-900 sm:text-4xl lg:text-5xl dark:text-foreground">
            A reliable IT solutions partner for businesses
          </h2>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-muted-foreground">
            Trust for practical software engineering, clear communication, and
            results-focused delivery
          </p>
        </div>

        <WhyChooseSpotlight />
        <LogoMarquee />
      </div>
    </section>
  )
}
