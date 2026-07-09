import Link from "next/link"
import type { ReactNode } from "react"

import { PageHeroBanner } from "@/components/layout/page-hero-banner"
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld"

type ServicePageHeroProps = {
  title: string
  breadcrumbLabel: string
  path: string
  children?: ReactNode
}

export function ServicePageHero({
  title,
  breadcrumbLabel,
  path,
  children,
}: ServicePageHeroProps) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services/web-development" },
          { name: breadcrumbLabel, path },
        ]}
      />
      <PageHeroBanner title={title}>
        <nav aria-label="Breadcrumb" className="mt-5">
          <ol className="inline-flex max-w-full flex-nowrap items-center gap-1.5 whitespace-nowrap rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white/70 backdrop-blur-sm sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
            <li>
              <Link href="/" className="transition-colors hover:text-white">
                Home
              </Link>
            </li>
            <li aria-hidden className="text-white/40">
              /
            </li>
            <li>
              <Link
                href="/services/web-development"
                className="transition-colors hover:text-white"
              >
                Services
              </Link>
            </li>
            <li aria-hidden className="text-white/40">
              /
            </li>
            <li className="font-semibold text-white">{breadcrumbLabel}</li>
          </ol>
        </nav>
        {children}
      </PageHeroBanner>
    </>
  )
}
