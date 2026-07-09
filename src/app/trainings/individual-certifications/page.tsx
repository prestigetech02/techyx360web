import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { ExploreSchools } from "@/components/trainings/explore-schools"
import { IndividualCertificationsInfo } from "@/components/trainings/individual-certifications-info"
import { Badge } from "@/components/ui/badge"
import { BrandCtaButton } from "@/components/ui/brand-cta-button"
import { buttonVariants } from "@/components/ui/button"
import { brand, siteMetadata } from "@/config/brand"
import { createPageMetadata } from "@/lib/seo"
import { cn } from "@/lib/utils"

const heroImage = "/ore.webp"

export const metadata: Metadata = createPageMetadata({
  title: `Individual Certifications | ${brand.name} - Tech Training Programs`,
  description:
    "Learn high-income digital skills from industry experts through hands-on training, real-world projects, and expert mentorship with Techyx360 certification programs.",
  path: "/trainings/individual-certifications",
  keywords: [
    "individual tech certifications",
    "digital skills training Nigeria",
    "professional certification prep",
    "tech training programs",
    ...siteMetadata.keywords.slice(0, 5),
  ],
})

export default function IndividualCertificationsPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden bg-[#f4f6fa] py-14 sm:py-16 lg:py-20 dark:bg-[#0f1524]">
        <Image
          src="/hero-element.svg"
          alt=""
          aria-hidden
          width={360}
          height={360}
          className="pointer-events-none absolute -top-10 -left-16 z-0 h-48 w-48 select-none object-contain opacity-[0.35] sm:-left-20 sm:h-52 sm:w-52 md:-top-8 md:-left-24 md:h-60 md:w-60 lg:top-0 lg:-left-28 lg:h-72 lg:w-72 dark:opacity-[0.45]"
        />
        <Image
          src="/hero-element.svg"
          alt=""
          aria-hidden
          width={360}
          height={360}
          className="pointer-events-none absolute -top-10 -right-16 z-0 h-48 w-48 select-none scale-x-[-1] object-contain opacity-[0.3] sm:-right-20 sm:h-52 sm:w-52 md:-top-8 md:-right-24 md:h-60 md:w-60 lg:top-0 lg:-right-28 lg:h-72 lg:w-72 dark:opacity-[0.4]"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-tl-xl rounded-bl-xl rounded-tr-[3rem] rounded-br-[3rem] lg:aspect-[5/4]">
              <Image
                src={heroImage}
                alt="Individual tech certification training"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="-scale-x-100 object-cover object-top"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>

            <div className="max-w-xl lg:max-w-none">
              <Badge
                variant="outline"
                className="mb-4 rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
              >
                Tech Training Programs
              </Badge>

              <h1 className="text-3xl font-bold tracking-tight text-balance text-zinc-900 sm:text-4xl lg:text-5xl dark:text-foreground">
                Learn High-Income Digital Skills From Industry Experts
              </h1>

              <p className="mt-4 text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-muted-foreground">
                Gain practical, job-ready skills through hands-on training,
                real-world projects, and expert mentorship.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <BrandCtaButton
                  href="/trainings/register"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Enroll Now
                </BrandCtaButton>
                <Link
                  href="/services/tech-trainings"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-11 px-6 text-base transition-all duration-300 hover:border-brand hover:bg-brand/10 hover:text-brand active:scale-[0.98] sm:h-12"
                  )}
                >
                  View Courses
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ExploreSchools />

      <IndividualCertificationsInfo />

      <section className="bg-[#f4f6fa] py-14 sm:py-16 lg:py-20 dark:bg-[#0f1524]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-[#0b2c66] p-6 sm:p-8 lg:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 right-0 h-56 w-56 sm:h-64 sm:w-64 lg:h-72 lg:w-72"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.22) 1.5px, transparent 1.5px)",
                backgroundSize: "14px 14px",
                WebkitMaskImage:
                  "radial-gradient(ellipse at top right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.55) 45%, transparent 72%)",
                maskImage:
                  "radial-gradient(ellipse at top right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.55) 45%, transparent 72%)",
              }}
            />

            <div className="relative z-10 mx-auto max-w-2xl text-center lg:max-w-3xl">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                Ready to Build a Future in Tech?
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-white/80 sm:text-base">
                Take the first step toward a rewarding career with practical
                training designed for today&apos;s digital economy.
              </p>

              <div className="mt-8 flex justify-center">
                <BrandCtaButton
                  href="/trainings/register"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Register Now
                </BrandCtaButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
