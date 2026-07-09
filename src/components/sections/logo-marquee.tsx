import Image from "next/image"

import { clientLogos } from "@/config/clients"
import { cn } from "@/lib/utils"

type LogoMarqueeProps = {
  className?: string
}

export function LogoMarquee({ className }: LogoMarqueeProps) {
  const logos = [...clientLogos, ...clientLogos]

  return (
    <div
      className={cn(
        "relative mt-6 overflow-hidden rounded-2xl bg-[#151b2b] py-8 sm:mt-7 md:mt-8 md:py-10 dark:bg-[#0f1524]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#151b2b] to-transparent dark:from-[#0f1524]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#151b2b] to-transparent dark:from-[#0f1524]" />

      <div className="logo-marquee-track flex w-max items-center gap-12 px-8 sm:gap-16 md:gap-20">
        {logos.map((logo, index) => (
          <div
            key={`${logo.name}-${index}`}
            className="flex h-10 shrink-0 items-center justify-center sm:h-12 md:h-14"
          >
            <Image
              src={logo.src}
              alt={`${logo.name} logo`}
              width={160}
              height={56}
              className="h-8 w-auto max-w-[180px] object-contain grayscale brightness-0 invert opacity-70 sm:h-10 md:h-11"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
