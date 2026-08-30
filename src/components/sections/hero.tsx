import Link from "next/link"
import Image from "next/image"

import { navigation } from "@/config/navigation"
import { brand } from "@/config/brand"
import { Badge } from "@/components/ui/badge"
import { BrandCtaButton } from "@/components/ui/brand-cta-button"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const servicesHref =
  navigation.find((item) => item.label === "Services")?.children?.[0]?.href ??
  "/services"

function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-lg -translate-y-4 sm:-translate-y-6 lg:max-w-none lg:-translate-y-8">
      <Image
        src="/hero2.webp"
        alt="Techyx360 technology solutions"
        fill
        priority
        sizes="(max-width: 1023px) 32rem, 50vw"
        className="rounded-3xl object-contain"
      />
    </div>
  )
}

export function Hero() {
  return (
    <section className="relative overflow-visible">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,var(--brand)_0%,transparent_50%)] opacity-[0.07]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Decorative SVG stays out of the image optimizer so it does not contend with LCP. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-element.svg"
          alt=""
          aria-hidden
          width={360}
          height={360}
          className="pointer-events-none absolute -top-12 -left-16 z-0 h-48 w-48 select-none object-contain opacity-[0.55] sm:-left-20 sm:h-52 sm:w-52 md:-top-8 md:-left-24 md:h-60 md:w-60 lg:top-0 lg:-left-28 lg:h-72 lg:w-72"
        />

      <div className="relative z-10 grid gap-12 py-16 md:py-20 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-24">
        <div className="relative flex flex-col items-start text-left">
          <div className="relative z-10 flex w-full flex-col items-start">
          <Badge
            variant="outline"
            className="mb-6 rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
          >
            TRUSTED IT PARTNER IN NIGERIA
          </Badge>

          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.15]">
            Leading IT Solutions Company in Nigeria Helping Businesses{" "}
            <span className="text-brand">Grow</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Techyx360 is a trusted IT solutions company in Nigeria delivering
            software development, web and mobile apps, IT consulting, and digital
            transformation services that help startups and enterprises scale
            faster.
          </p>

          <div className="mt-8 inline-flex w-full flex-col items-center gap-0 sm:w-auto">
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <BrandCtaButton href="/contact" className="md:h-12">
                Get Started
              </BrandCtaButton>
              <Link
                href={servicesHref}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "group h-11 px-6 text-base transition-all duration-300 hover:scale-[1.03] hover:border-brand hover:bg-brand/10 hover:text-brand active:scale-[0.98] md:h-12"
                )}
              >
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">
                  View Our Services
                </span>
              </Link>
            </div>

            <Image
              src={brand.heroArrow}
              alt="You get your desired result or your money back. T and C applies."
              width={340}
              height={96}
              className="-mt-3 block h-auto w-full max-w-[200px] object-contain sm:max-w-[240px] md:-mt-4 md:max-w-[280px]"
            />
          </div>
          </div>
        </div>

        <HeroVisual />
      </div>
      </div>
    </section>
  )
}
