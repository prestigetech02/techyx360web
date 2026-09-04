import type { Metadata } from "next"
import Image from "next/image"

import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld"
import { JsonLd } from "@/components/seo/json-ld"
import { Badge } from "@/components/ui/badge"
import { BrandCtaButton } from "@/components/ui/brand-cta-button"
import { brand, siteMetadata } from "@/config/brand"
import { portfolioItems } from "@/config/portfolio"
import { createPageMetadata } from "@/lib/seo"
import { getPortfolioSchema } from "@/lib/structured-data"

export const metadata: Metadata = createPageMetadata({
  title: `Our Portfolio | ${brand.name} - Selected Work & Clients`,
  description:
    "See selected work from Techyx360 — websites, mobile apps, and software we have delivered for businesses in Nigeria.",
  path: "/portfolio",
  keywords: [
    "Techyx360 portfolio",
    "IT projects Nigeria",
    "software development case studies",
    "web development portfolio Lagos",
    ...siteMetadata.keywords.slice(0, 4),
  ],
})

export default function PortfolioPage() {
  return (
    <main className="flex flex-1 flex-col">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Our Portfolio", path: "/portfolio" },
        ]}
      />
      <JsonLd data={getPortfolioSchema(portfolioItems)} />

      <section className="relative isolate overflow-hidden py-8 sm:py-10 lg:py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
        >
          <Image
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[#eef4ff]/88 dark:bg-[#0f1524]/82" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <Badge
              variant="outline"
              className="mb-4 rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
            >
              Our Portfolio
            </Badge>

            <h1 className="text-3xl font-bold tracking-tight text-balance text-zinc-900 sm:text-4xl lg:text-5xl dark:text-foreground">
              Work we are proud to stand behind
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-muted-foreground">
              A look at brands we have partnered with on software, websites,
              mobile apps, and digital products across Nigeria.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#f4f6fa] py-14 sm:py-16 lg:py-20 dark:bg-[#0f1524]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {portfolioItems.map((item) => (
              <li
                key={item.src}
                className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_12px_40px_rgba(15,27,61,0.08)] transition-transform duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-[#161f35] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
              >
                <div className="relative aspect-[4/3] w-full bg-zinc-100 dark:bg-[#121a2e]">
                  <Image
                    src={item.src.replaceAll(" ", "%20")}
                    alt={`${item.name} — ${item.category}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-top"
                  />
                </div>
                <div className="px-5 py-4">
                  <h2 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl dark:text-white">
                    {item.name}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {item.category}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-12 flex flex-col items-center rounded-3xl border border-border/60 bg-white px-6 py-10 text-center sm:mt-16 sm:px-10 dark:border-white/10 dark:bg-[#161f35]">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
              Have a project in mind?
            </h2>
            <p className="mt-3 max-w-xl text-base text-zinc-600 dark:text-zinc-400">
              Tell us what you want to build. We will help you scope it, ship it,
              and support it.
            </p>
            <BrandCtaButton href="/contact" className="mt-6">
              Start a conversation
            </BrandCtaButton>
          </div>
        </div>
      </section>
    </main>
  )
}
