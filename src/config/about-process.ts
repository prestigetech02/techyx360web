import { Code2, GraduationCap, HeadphonesIcon, Wrench } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type AboutProcessStep = {
  id: string
  title: string
  description: string
  icon: LucideIcon
}

export const aboutProcessSteps: AboutProcessStep[] = [
  {
    id: "consultation",
    title: "Initial Consultation & Discovery",
    description:
      "We work closely with your team to understand your business goals, challenges, and technical requirements—so we can define the right scope and success metrics for your project.",
    icon: HeadphonesIcon,
  },
  {
    id: "design-dev",
    title: "Solution Design & Development",
    description:
      "Our engineers design and build customized solutions aligned to your workflows, ensuring secure, scalable performance for modern web and mobile platforms.",
    icon: Code2,
  },
  {
    id: "implementation-training",
    title: "Implementation & Training",
    description:
      "We implement and deploy your solution confidently, then provide practical training to your staff—so adoption is smooth and your team can use the technology effectively.",
    icon: Wrench,
  },
  {
    id: "support-optimization",
    title: "Ongoing Support & Optimization",
    description:
      "After launch, we deliver ongoing support, maintenance, monitoring, and optimization to keep your systems fast, stable, and ready for future growth.",
    icon: GraduationCap,
  },
]

