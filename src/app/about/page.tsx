import type { Metadata } from "next"
import dynamic from "next/dynamic"

import { AboutHero } from "@/components/sections/about-hero"
import { brand, siteMetadata } from "@/config/brand"
import { createPageMetadata } from "@/lib/seo"

const AboutPrinciples = dynamic(() =>
  import("@/components/sections/about-principles").then((mod) => mod.AboutPrinciples)
)
const AboutProcess = dynamic(() =>
  import("@/components/sections/about-process").then((mod) => mod.AboutProcess)
)
const AboutStats = dynamic(() =>
  import("@/components/sections/about-stats").then((mod) => mod.AboutStats)
)

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
