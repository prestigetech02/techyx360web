import { EyeIcon, GemIcon, TargetIcon, type LucideIcon } from "lucide-react"

export type AboutPrinciple = {
  id: string
  title: string
  description: string
  icon: LucideIcon
}

export const aboutPrinciples: AboutPrinciple[] = [
  {
    id: "mission",
    title: "Our Mission",
    description:
      "To empower Nigerian businesses with innovative, reliable technology solutions that solve real problems, improve operations, and drive sustainable growth.",
    icon: TargetIcon,
  },
  {
    id: "vision",
    title: "Our Vision",
    description:
      "To be Nigeria's most trusted IT solutions partner, recognized across Africa for excellence in software development, digital transformation, and tech education.",
    icon: EyeIcon,
  },
  {
    id: "core-values",
    title: "Core Values",
    description:
      "Integrity, innovation, excellence, client success, and collaboration guide how we build products, serve businesses, and support teams across Nigeria.",
    icon: GemIcon,
  },
]
