"use client"

import { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

const INTERACTIVE =
  'a, button, [role="button"], input, textarea, select, label, summary, [data-cursor="hover"]'

export function CursorFollower() {
  const [enabled, setEnabled] = useState(false)
  const [visible, setVisible] = useState(false)
  const [hovering, setHovering] = useState(false)

  const rawX = useMotionValue(-100)
  const rawY = useMotionValue(-100)

  const x = useSpring(rawX, { stiffness: 450, damping: 35, mass: 0.5 })
  const y = useSpring(rawY, { stiffness: 450, damping: 35, mass: 0.5 })

  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (!canHover || reduceMotion) return

    setEnabled(true)
    document.documentElement.classList.add("custom-cursor")

    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX)
      rawY.set(e.clientY)
      setVisible(true)

      const target = e.target as Element | null
      setHovering(Boolean(target?.closest(INTERACTIVE)))
    }

    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    window.addEventListener("mousemove", onMove, { passive: true })
    document.addEventListener("mouseleave", onLeave)
    document.addEventListener("mouseenter", onEnter)

    return () => {
      document.documentElement.classList.remove("custom-cursor")
      window.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseleave", onLeave)
      document.removeEventListener("mouseenter", onEnter)
    }
  }, [rawX, rawY])

  if (!enabled) return null

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[10001] mix-blend-difference"
      style={{ x, y }}
    >
      <motion.div
        className="rounded-full bg-white"
        animate={{
          width: hovering ? 72 : 16,
          height: hovering ? 72 : 16,
          x: hovering ? -36 : -8,
          y: hovering ? -36 : -8,
          opacity: visible ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 320, damping: 24, mass: 0.4 }}
      />
    </motion.div>
  )
}
