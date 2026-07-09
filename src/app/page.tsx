import type { Metadata } from "next"

import { Hero } from "@/components/sections/hero"
import { ServicesGrid } from "@/components/sections/services-grid"
import { ServicesIntro } from "@/components/sections/services-intro"
import { Testimonials } from "@/components/sections/testimonials"
import { WhyChoose } from "@/components/sections/why-choose"
import { siteMetadata } from "@/config/brand"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: siteMetadata.title,
  description: siteMetadata.description,
  path: "/",
  keywords: [...siteMetadata.keywords],
})

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <ServicesIntro />
      <ServicesGrid />
      <WhyChoose />
      <Testimonials />
    </main>
  )
}
