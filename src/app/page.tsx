import type { Metadata } from "next"
import dynamic from "next/dynamic"

import { Hero } from "@/components/sections/hero"
import { ServicesGrid } from "@/components/sections/services-grid"
import { ServicesIntro } from "@/components/sections/services-intro"
import { siteMetadata } from "@/config/brand"
import { createPageMetadata } from "@/lib/seo"

const WhyChoose = dynamic(() =>
  import("@/components/sections/why-choose").then((mod) => mod.WhyChoose)
)

const Testimonials = dynamic(() =>
  import("@/components/sections/testimonials").then((mod) => mod.Testimonials)
)

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
