import type { Metadata } from "next"

import { ContactForm } from "@/components/contact/contact-form"
import { ContactInfoCards } from "@/components/contact/contact-info-cards"
import { Badge } from "@/components/ui/badge"
import { brand, siteMetadata } from "@/config/brand"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: `Contact Us | ${brand.name} - IT Solutions Company in Nigeria`,
  description:
    "Contact Techyx360 for IT solutions in Nigeria. Reach our Lagos team for software development, web design, mobile apps, IT consulting, and digital marketing support.",
  path: "/contact",
  keywords: [
    "contact Techyx360",
    "IT company contact Nigeria",
    "software development Lagos contact",
    ...siteMetadata.keywords.slice(0, 5),
  ],
})

export default function ContactPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-[#f4f6fa] py-14 dark:bg-[#0f1524] sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-3xl text-center lg:mb-12">
            <Badge
              variant="outline"
              className="mb-4 rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
            >
              Contact Us
            </Badge>

            <h1 className="text-3xl font-bold tracking-tight text-balance text-zinc-900 sm:text-4xl lg:text-5xl dark:text-foreground">
              Get in touch with our team
            </h1>

            <p className="mt-4 text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-muted-foreground">
              Have a project in mind or need expert IT support in Nigeria? Send us
              a message and we&apos;ll respond as soon as possible.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            <ContactInfoCards className="lg:col-span-1" />
            <ContactForm className="lg:col-span-2" />
          </div>
        </div>
      </section>
    </main>
  )
}
