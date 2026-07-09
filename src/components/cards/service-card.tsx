import Link from "next/link"
import { ArrowRight, ArrowUpRight, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type ServiceCardProps = {
  title: string
  description: string
  href: string
  icon: LucideIcon
  className?: string
}

/** Icon tile size (the rounded square sitting in the corner) */
const ICON_SIZE = 72
/** Visible gap between the white card cutout edge and the icon tile */
const GUTTER = 8
/** Border radius of the icon tile */
const ICON_RADIUS = 20
/** Size of the punched hole (icon + gutter on both sides) */
const CUTOUT_SIZE = ICON_SIZE + GUTTER * 2
/** Radius of the punched hole (icon radius + gutter so corners parallel) */
const CUTOUT_RADIUS = ICON_RADIUS + GUTTER

function cutoutMaskSvg() {
  return encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CUTOUT_SIZE}" height="${CUTOUT_SIZE}">
      <rect width="${CUTOUT_SIZE}" height="${CUTOUT_SIZE}" rx="${CUTOUT_RADIUS}" ry="${CUTOUT_RADIUS}" fill="black"/>
    </svg>`
  )
}

export function ServiceCard({
  title,
  description,
  href,
  icon: Icon,
  className,
}: ServiceCardProps) {
  const hole = `url("data:image/svg+xml;utf8,${cutoutMaskSvg()}")`

  return (
    <Link
      href={href}
      className={cn(
        "group relative block min-h-[300px] rounded-[1.75rem] transition-transform duration-300 hover:-translate-y-1",
        className
      )}
    >
      {/* White card with a rounded-square bite taken from the top-right */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-[1.75rem] border border-border/40 bg-card shadow-[0_10px_40px_rgba(15,23,42,0.06)] transition-shadow duration-300 group-hover:shadow-[0_16px_48px_rgba(15,23,42,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.25)]"
        style={{
          WebkitMaskImage: `linear-gradient(#000 0 0), ${hole}`,
          maskImage: `linear-gradient(#000 0 0), ${hole}`,
          WebkitMaskPosition: "0 0, top right",
          maskPosition: "0 0, top right",
          WebkitMaskSize: `100% 100%, ${CUTOUT_SIZE}px ${CUTOUT_SIZE}px`,
          maskSize: `100% 100%, ${CUTOUT_SIZE}px ${CUTOUT_SIZE}px`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskComposite: "destination-out",
          maskComposite: "exclude",
        }}
      />

      {/* The cutout piece — rounded square icon box */}
      <div
        className="absolute z-20 flex items-center justify-center bg-brand/10 [perspective:600px] transition-colors duration-300 group-hover:bg-brand"
        style={{
          top: GUTTER,
          right: GUTTER,
          width: ICON_SIZE,
          height: ICON_SIZE,
          borderRadius: ICON_RADIUS,
        }}
      >
        <Icon className="size-8 text-brand transition-all duration-500 ease-in-out [transform-style:preserve-3d] group-hover:rotate-y-180 group-hover:text-white" />
      </div>

      <div className="relative z-10 flex min-h-[300px] flex-col px-8 pt-8 pb-5 pr-24">
        <h3 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
          {title}
        </h3>

        <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          {description}
        </p>

        <div className="mt-auto border-t border-border/70 pt-5">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors duration-300 group-hover:text-[#eaaa33] md:text-base">
            Read More
            <span className="relative size-4">
              <ArrowUpRight className="absolute inset-0 size-4 transition-all duration-300 group-hover:scale-75 group-hover:opacity-0" />
              <ArrowRight className="absolute inset-0 size-4 scale-75 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:scale-100 group-hover:opacity-100" />
            </span>
          </span>
        </div>
      </div>
    </Link>
  )
}
