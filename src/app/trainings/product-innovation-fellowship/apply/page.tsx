import type { Metadata } from "next"
import Link from "next/link"

import { PageHeroBanner } from "@/components/layout/page-hero-banner"
import { PifApplyForm } from "@/components/trainings/pif-apply-form"
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld"
import { brand, siteMetadata } from "@/config/brand"
import {
  pifApplyPath,
  pifCoursePath,
} from "@/config/product-innovation-fellowship"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: `Apply for Product Innovation Fellowship | ${brand.name}`,
  description:
    "Apply for the Techyx360 Product Innovation Fellowship. Share your background, preferred track, and goals to join our 12-week immersive product-building program.",
  path: pifApplyPath,
  ogImage: "/pil-og.jpg",
  ogImageAlt:
    "Apply for the Product Innovation Fellowship at Techyx360",
  ogImageWidth: 1200,
  ogImageHeight: 630,
  keywords: [
    "apply product innovation fellowship",
    "PIF application",
    "product fellowship Nigeria",
    "Techyx360 fellowship apply",
    ...siteMetadata.keywords.slice(0, 4),
  ],
})

export default function PifApplyPage() {
  return (
    <main className="flex flex-1 flex-col">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Trainings", path: "/trainings/register" },
          {
            name: "Product Innovation Fellowship",
            path: pifCoursePath,
          },
          { name: "Apply", path: pifApplyPath },
        ]}
      />

      <PageHeroBanner title="Apply for the Product Innovation Fellowship">
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
          Complete the form below to tell us about yourself, your preferred
          track, and what you hope to achieve in the 12-week fellowship.
        </p>
        <p className="mt-3 text-sm text-white/65">
          <Link
            href={pifCoursePath}
            className="font-medium text-brand transition-colors hover:text-[#eaaa33]"
          >
            View fellowship details
          </Link>
        </p>
      </PageHeroBanner>

      <section className="bg-background py-12 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
            <PifApplyForm />
          </div>
        </div>
      </section>
    </main>
  )
}
