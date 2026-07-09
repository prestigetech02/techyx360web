import type { Metadata } from "next"

import { AboutHero } from "@/components/sections/about-hero"
import { AboutPrinciples } from "@/components/sections/about-principles"
import { AboutProcess } from "@/components/sections/about-process"
import { AboutStats } from "@/components/sections/about-stats"
import { brand, siteMetadata } from "@/config/brand"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: `About Us | ${brand.name} - IT Solutions Company in Nigeria`,
  description:
    "Learn about Techyx360 — a trusted IT solutions company in Nigeria helping businesses innovate with software, web, mobile, consulting, and digital marketing.",
  path: "/about",
  keywords: [
    "about Techyx360",
    "IT company Nigeria",
    "technology solutions Lagos",
    ...siteMetadata.keywords.slice(0, 5),
  ],
})

export default function AboutPage() {
  return (
    <main className="flex flex-1 flex-col">
      <AboutHero />
      <AboutPrinciples />
      <AboutProcess />
      <AboutStats />
    </main>
  )
}
