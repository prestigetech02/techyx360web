"use client"

import { motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"

import { aboutStats, type AboutStat } from "@/config/about-stats"

function formatStat(stat: AboutStat, value: number) {
  if (stat.format === "percent") return `${Math.round(value)}%`
  if (stat.format === "plus") return `${Math.round(value)}+`
  return `${Math.round(value)}`
}

function useCountUp(target: number, durationMs: number, enabled: boolean) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!enabled) {
      setValue(0)
      return
    }

    let raf = 0
    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(1, elapsed / durationMs)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic

      setValue(target * eased)

      if (progress < 1) {
        raf = window.requestAnimationFrame(tick)
      }
    }

    raf = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(raf)
  }, [target, durationMs, enabled])

  return value
}

function StatCircle({ stat, index }: { stat: AboutStat; index: number }) {
  const [inView, setInView] = useState(false)
  const [refEl, setRefEl] = useState<HTMLElement | null>(null)

  const durationMs = 1100
  const value = useCountUp(stat.target, durationMs, inView)

  const formatted = useMemo(() => formatStat(stat, value), [stat, value])

  useEffect(() => {
    if (!refEl) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) setInView(true)
      },
      { threshold: 0.4 }
    )

    observer.observe(refEl)
    return () => observer.disconnect()
  }, [refEl])

  return (
    <motion.div
      ref={(node) => setRefEl(node)}
      initial={false}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: 0.06 + index * 0.1 }}
      className="flex justify-center"
    >
      <div className="flex aspect-square w-full max-w-[175px] flex-col items-center justify-center rounded-full border-2 border-brand/35 bg-white/80 text-center backdrop-blur-sm sm:max-w-[185px] dark:border-white/15 dark:bg-white/5">
        <div className="text-[44px] font-extrabold leading-none tracking-tight text-[#0f1b3d] dark:text-white">
          {formatted}
        </div>
        <div className="mt-2 text-sm font-medium text-[#0f1b3d]/80 dark:text-white/70">
          {stat.label}
        </div>
      </div>
    </motion.div>
  )
}

export function AboutStats() {
  return (
    <section className="bg-background py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {aboutStats.map((stat, index) => (
            <StatCircle key={stat.id} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

