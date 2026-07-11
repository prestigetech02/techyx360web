import Image from "next/image"

import { cn } from "@/lib/utils"

const dotPatternStyle = {
  backgroundImage:
    "radial-gradient(circle, rgba(255,255,255,0.28) 1.5px, transparent 1.5px)",
  backgroundSize: "12px 12px",
} as const

const softDotPatternStyle = {
  backgroundImage:
    "radial-gradient(circle, rgba(255,255,255,0.16) 1.5px, transparent 1.5px)",
  backgroundSize: "16px 16px",
} as const

type PageHeroBackgroundProps = {
  className?: string
}

export function PageHeroBackground({ className }: PageHeroBackgroundProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          ...dotPatternStyle,
          WebkitMaskImage:
            "linear-gradient(225deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.75) 18%, rgba(0,0,0,0.35) 42%, transparent 68%)",
          maskImage:
            "linear-gradient(225deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.75) 18%, rgba(0,0,0,0.35) 42%, transparent 68%)",
        }}
      />

      <div
        className="absolute inset-0 opacity-40"
        style={{
          ...softDotPatternStyle,
          WebkitMaskImage:
            "linear-gradient(225deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 28%, transparent 55%)",
          maskImage:
            "linear-gradient(225deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 28%, transparent 55%)",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-br from-[#0b2c66] via-[#0b2c66]/95 to-[#123d8a]/85" />

      <div className="absolute -top-20 right-[12%] size-72 rounded-full bg-[#eaaa33]/20 blur-3xl" />
      <div className="absolute -bottom-28 left-[8%] size-96 rounded-full bg-[#3b82f6]/25 blur-3xl" />
      <div className="absolute top-1/2 -right-16 size-64 -translate-y-1/2 rounded-full bg-white/10 blur-2xl" />

      <Image
        src="/hero-element.svg"
        alt=""
        width={360}
        height={360}
        className="absolute -top-8 -left-20 h-56 w-56 select-none object-contain opacity-[0.22] sm:-left-24 sm:h-64 sm:w-64 lg:-left-28 lg:h-72 lg:w-72"
      />
      <Image
        src="/hero-element.svg"
        alt=""
        width={360}
        height={360}
        className="absolute -top-8 -right-20 h-56 w-56 scale-x-[-1] select-none object-contain opacity-[0.18] sm:-right-24 sm:h-64 sm:w-64 lg:-right-28 lg:h-72 lg:w-72"
      />

      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    </div>
  )
}
