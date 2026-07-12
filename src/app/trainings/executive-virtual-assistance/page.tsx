import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { ExecutiveVirtualAssistanceFaq } from "@/components/trainings/executive-virtual-assistance-faq"
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld"
import { JsonLd } from "@/components/seo/json-ld"
import { Badge } from "@/components/ui/badge"
import { BrandCtaButton } from "@/components/ui/brand-cta-button"
import { buttonVariants } from "@/components/ui/button"
import {
  evaAdditionalRoles,
  evaCareerBenefits,
  evaFaqs,
  evaHero,
  evaInvestmentIncludes,
  evaJobRoles,
  evaPricing,
  evaProgramBenefits,
  evaRegisterPath,
  evaRelatedPrograms,
  evaShareImage,
  evaShareImageAlt,
} from "@/config/executive-virtual-assistance"
import { Check, Sparkles } from "lucide-react"
import { siteMetadata } from "@/config/brand"
import { createPageMetadata } from "@/lib/seo"
import { getFaqSchema } from "@/lib/structured-data"
import { cn } from "@/lib/utils"

export const metadata: Metadata = createPageMetadata({
  title:
    "Executive Virtual Assistance Course | Techyx360 Technologies",
  description:
    "Work remotely and launch your EVA career with Techyx360. Learn administrative support, productivity tools, and client-ready skills through a 10-week hands-on certification program.",
  path: "/trainings/executive-virtual-assistance",
  ogImage: evaShareImage,
  ogImageAlt: evaShareImageAlt,
  ogImageWidth: 1672,
  ogImageHeight: 941,
  keywords: [
    "executive virtual assistance course",
    "virtual assistant training Nigeria",
    "EVA certification",
    "remote administrative support training",
    ...siteMetadata.keywords.slice(0, 5),
  ],
})

export default function ExecutiveVirtualAssistancePage() {
  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={getFaqSchema(evaFaqs)} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Trainings", path: "/trainings/register" },
          {
            name: "Executive Virtual Assistance",
            path: "/trainings/executive-virtual-assistance",
          },
        ]}
      />
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
            <div className="max-w-xl lg:max-w-none">
              <Badge
                variant="outline"
                className="mb-4 rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
              >
                {evaHero.badge}
              </Badge>

              <h1 className="text-3xl font-bold tracking-tight text-balance text-zinc-900 sm:text-4xl lg:text-5xl dark:text-foreground">
                {evaHero.title}
              </h1>

              <p className="mt-4 text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-muted-foreground">
                {evaHero.description} Part of our{" "}
                <Link
                  href="/trainings/individual-certifications"
                  className="font-medium text-brand underline-offset-2 hover:underline"
                >
                  individual certifications
                </Link>{" "}
                track —{" "}
                <Link
                  href={evaRegisterPath}
                  className="font-medium text-brand underline-offset-2 hover:underline"
                >
                  enroll today
                </Link>{" "}
                to get started.
              </p>

              <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#eaaa33] sm:text-base">
                Duration: 10 Weeks · 3 sessions per week
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <BrandCtaButton href={evaRegisterPath}>Enroll Now</BrandCtaButton>
                <Link
                  href="#eva-faq"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-11 px-6 text-base transition-all duration-300 hover:border-brand hover:bg-brand/10 hover:text-brand active:scale-[0.98] sm:h-12"
                  )}
                >
                  View FAQ
                </Link>
              </div>
            </div>

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-tr-xl rounded-br-xl rounded-tl-[3rem] rounded-bl-[3rem] lg:aspect-[5/4]">
              <Image
                src={evaHero.image}
                alt={evaHero.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Badge
              variant="outline"
              className="mb-4 rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
            >
              EVA Benefits
            </Badge>

            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl dark:text-foreground">
              Why Become an Executive Virtual Assistant?
            </h2>

            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Remote work is here to stay — and skilled EVAs are in demand across
              startups, agencies, and executive teams. Explore our{" "}
              <Link
                href="/trainings/bootcamps"
                className="font-medium text-brand underline-offset-2 hover:underline"
              >
                bootcamps
              </Link>{" "}
              and{" "}
              <Link
                href="/services/tech-trainings"
                className="font-medium text-brand underline-offset-2 hover:underline"
              >
                tech training services
              </Link>{" "}
              for more ways to grow your digital career.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:gap-6">
            {evaCareerBenefits.map((benefit) => {
              const Icon = benefit.icon

              return (
                <article
                  key={benefit.title}
                  className="group rounded-2xl border border-border/60 bg-card p-5 transition-all duration-300 hover:border-brand/30 hover:shadow-md sm:p-6"
                >
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors duration-300 [perspective:600px] group-hover:bg-brand">
                    <Icon
                      className="size-5 transition-all duration-500 ease-in-out [transform-style:preserve-3d] group-hover:rotate-y-180 group-hover:text-white"
                      aria-hidden
                    />
                  </span>

                  <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-foreground">
                    {benefit.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {benefit.description}
                  </p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#f4f6fa] py-14 sm:py-16 lg:py-20 dark:bg-[#0f1524]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Badge
              variant="outline"
              className="mb-4 rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
            >
              Program Highlights
            </Badge>

            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl dark:text-foreground">
              What You Get From the Training
            </h2>

            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              From certification to job placement support, this program is built
              to get you client-ready. See{" "}
              <Link
                href="#eva-pricing"
                className="font-medium text-brand underline-offset-2 hover:underline"
              >
                pricing and what&apos;s included
              </Link>{" "}
              or{" "}
              <Link
                href={evaRegisterPath}
                className="font-medium text-brand underline-offset-2 hover:underline"
              >
                register now
              </Link>{" "}
              to secure your spot.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {evaProgramBenefits.map((benefit) => {
              const Icon = benefit.icon

              return (
                <article
                  key={benefit.title}
                  className="group rounded-2xl border border-border/60 bg-card p-5 transition-all duration-300 hover:border-brand/30 hover:shadow-md sm:p-6"
                >
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors duration-300 [perspective:600px] group-hover:bg-brand">
                    <Icon
                      className="size-5 transition-all duration-500 ease-in-out [transform-style:preserve-3d] group-hover:rotate-y-180 group-hover:text-white"
                      aria-hidden
                    />
                  </span>

                  <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-foreground">
                    {benefit.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {benefit.description}
                  </p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section
        id="eva-pricing"
        className="scroll-mt-24 bg-background py-14 sm:py-16 lg:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
            <div className="grid lg:grid-cols-2">
              <div className="flex flex-col border-b border-border/60 bg-[#f4f6fa] p-6 sm:p-8 lg:border-b-0 lg:border-r dark:bg-[#0f1524]">
                <Badge
                  variant="outline"
                  className="mb-4 inline-flex rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
                >
                  Your Investment
                </Badge>

                <div className="flex flex-wrap items-end gap-3">
                  <p className="text-4xl font-bold tracking-tight text-brand sm:text-5xl">
                    {evaPricing.currentPrice}
                  </p>
                  <p className="pb-1 text-lg font-semibold text-muted-foreground line-through sm:text-xl">
                    {evaPricing.regularPrice}
                  </p>
                </div>

                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  {evaPricing.description}
                </p>

                <p className="mt-6 text-sm font-medium text-zinc-700 dark:text-foreground">
                  Flexible payment options are available.
                </p>

                <div className="mt-auto hidden border-t border-border/60 pt-6 lg:block">
                  <p className="text-base font-semibold text-zinc-900 dark:text-foreground">
                    Ready to start your EVA career?
                  </p>
                  <div className="mt-4">
                    <BrandCtaButton href={evaRegisterPath}>
                      Enroll Now
                    </BrandCtaButton>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-foreground">
                  What&apos;s Included
                </h3>

                <ul className="mt-5 space-y-3">
                  {evaInvestmentIncludes.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm font-medium text-zinc-800 sm:text-base dark:text-foreground"
                    >
                      <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
                        <Check className="size-3.5" strokeWidth={3} aria-hidden />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-border/60 p-6 sm:p-8 lg:hidden">
                <p className="text-base font-semibold text-zinc-900 dark:text-foreground">
                  Ready to start your EVA career?
                </p>
                <div className="mt-4">
                  <BrandCtaButton href={evaRegisterPath}>Enroll Now</BrandCtaButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="eva-faq"
        className="scroll-mt-24 bg-background py-14 sm:py-16 lg:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start lg:gap-14">
            <div className="max-w-xl">
              <Badge
                variant="outline"
                className="mb-4 rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
              >
                FAQ
              </Badge>

              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl dark:text-foreground">
                Frequently Asked Questions
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Everything you need to know before enrolling in the Executive
                Virtual Assistance program. Still unsure?{" "}
                <Link
                  href="/contact"
                  className="font-medium text-brand underline-offset-2 hover:underline"
                >
                  Contact our team
                </Link>{" "}
                and we&apos;ll help you decide.
              </p>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8">
              <ExecutiveVirtualAssistanceFaq />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f4f6fa] py-14 sm:py-16 lg:py-20 dark:bg-[#0f1524]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Badge
              variant="outline"
              className="mb-4 rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
            >
              Career Paths
            </Badge>

            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl dark:text-foreground">
              Jobs You Can Apply for as a Virtual Assistant
            </h2>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {evaJobRoles.map((role) => {
              const Icon = role.icon

              return (
                <article
                  key={role.title}
                  className="group rounded-2xl border border-border/60 bg-card p-5 transition-all duration-300 hover:border-brand/30 hover:shadow-md sm:p-6"
                >
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors duration-300 [perspective:600px] group-hover:bg-brand">
                    <Icon
                      className="size-5 transition-all duration-500 ease-in-out [transform-style:preserve-3d] group-hover:rotate-y-180 group-hover:text-white"
                      aria-hidden
                    />
                  </span>

                  <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-foreground">
                    {role.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {role.description}
                  </p>
                </article>
              )
            })}

            <article className="group rounded-2xl border border-border/60 bg-card p-5 transition-all duration-300 hover:border-brand/30 hover:shadow-md sm:p-6">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors duration-300 [perspective:600px] group-hover:bg-brand">
                <Sparkles
                  className="size-5 transition-all duration-500 ease-in-out [transform-style:preserve-3d] group-hover:rotate-y-180 group-hover:text-white"
                  aria-hidden
                />
              </span>

              <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-foreground">
                And Many More
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {evaAdditionalRoles}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-background py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Badge
              variant="outline"
              className="mb-4 inline-flex rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
            >
              Related Programs
            </Badge>

            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-foreground">
              Explore more Techyx360 trainings
            </h2>
          </div>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {evaRelatedPrograms.map((program) => (
              <li key={program.href}>
                <Link
                  href={program.href}
                  className="group flex h-full flex-col rounded-2xl border border-border/60 bg-card p-5 transition-all duration-300 hover:border-brand/30 hover:shadow-md sm:p-6"
                >
                  <span className="text-base font-semibold text-zinc-900 group-hover:text-brand dark:text-foreground">
                    {program.label}
                  </span>
                  <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {program.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-background py-14 sm:py-16 lg:py-20">
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
                Ready to Become That Professional Virtual Assistant?
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-white/80 sm:text-base">
                Take the next step toward a flexible, in-demand remote career.
                Enroll today or reach out if you have questions.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <BrandCtaButton href={evaRegisterPath}>
                  Enroll Now
                </BrandCtaButton>
                <Link
                  href="/contact"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-11 border-white/30 bg-transparent px-6 text-base text-white transition-all duration-300 hover:border-white hover:bg-white/10 hover:text-white active:scale-[0.98] sm:h-12"
                  )}
                >
                  Send Us a Message
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
