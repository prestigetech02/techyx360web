import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const brandCtaClassName = cn(
  buttonVariants(),
  "group relative h-11 gap-1.5 bg-brand px-6 text-base font-semibold text-brand-foreground transition-all duration-300 hover:scale-[1.02] hover:bg-[#eaaa33] hover:text-[#1a1408] active:scale-[0.98] sm:h-12"
)

export function BrandCtaIcon() {
  return (
    <span className="relative size-4 shrink-0">
      <ArrowUpRight
        aria-hidden
        className="absolute inset-0 size-4 transition-all duration-300 group-hover:scale-75 group-hover:opacity-0"
      />
      <ArrowRight
        aria-hidden
        className="absolute inset-0 size-4 scale-75 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:scale-100 group-hover:opacity-100"
      />
    </span>
  )
}

type BrandCtaButtonProps = {
  children: React.ReactNode
  className?: string
  target?: string
  rel?: string
} & (
  | {
      href: string
      type?: never
      onClick?: never
    }
  | {
      href?: never
      type?: "button" | "submit"
      onClick?: React.MouseEventHandler<HTMLButtonElement>
    }
)

export function BrandCtaButton({
  children,
  className,
  href,
  type = "button",
  onClick,
  target,
  rel,
}: BrandCtaButtonProps) {
  const classes = cn(brandCtaClassName, className)

  if (href) {
    return (
      <Link href={href} target={target} rel={rel} className={classes}>
        {children}
        <BrandCtaIcon />
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
      <BrandCtaIcon />
    </button>
  )
}

export { brandCtaClassName }
