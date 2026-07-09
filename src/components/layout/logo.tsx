import Image from "next/image"
import Link from "next/link"

import { brand } from "@/config/brand"
import { cn } from "@/lib/utils"

type LogoProps = {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("inline-flex shrink-0 items-center", className)}>
      <Image
        src={brand.logo.light}
        alt={brand.name}
        width={200}
        height={50}
        priority
        className="h-9 w-auto md:h-11 dark:hidden"
      />
      <Image
        src={brand.logo.dark}
        alt={brand.name}
        width={200}
        height={50}
        priority
        className="hidden h-10 w-auto md:h-12 dark:block"
      />
      <span className="sr-only">{brand.name}</span>
    </Link>
  )
}
