import {
  Briefcase,
  Globe2,
  GraduationCap,
  Rocket,
  type LucideIcon,
} from "lucide-react"

import {
  careerHighlights,
  type CareerHighlight,
} from "@/config/careers"
import { cn } from "@/lib/utils"

const iconMap: Record<CareerHighlight["icon"], LucideIcon> = {
  briefcase: Briefcase,
  rocket: Rocket,
  graduation: GraduationCap,
  globe: Globe2,
}

export function CareersHighlights() {
  return (
    <div className="relative z-20 mx-auto -mt-12 max-w-7xl px-4 sm:-mt-14 sm:px-6 lg:-mt-16 lg:px-8">
      <div className="rounded-2xl border border-border/50 bg-white px-4 py-5 shadow-[0_12px_40px_-12px_rgba(15,21,36,0.28)] sm:rounded-3xl sm:px-6 sm:py-6 lg:px-8 dark:border-white/10 dark:bg-card dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.45)]">
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-0 lg:grid-cols-4">
          {careerHighlights.map((highlight, index) => {
            const Icon = iconMap[highlight.icon]

            return (
              <li
                key={highlight.id}
                className={cn(
                  "flex items-center gap-3 sm:px-4 lg:px-5",
                  index > 0 &&
                    "sm:border-l sm:border-border/70 dark:sm:border-white/10",
                  index === 2 && "sm:border-l-0 lg:border-l"
                )}
              >
                <span className="inline-flex size-10 shrink-0 items-center justify-center text-brand sm:size-11">
                  <Icon className="size-6 sm:size-7" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-base font-bold tracking-tight text-[#0f1524] sm:text-lg dark:text-foreground">
                    {highlight.value}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                    {highlight.label}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
