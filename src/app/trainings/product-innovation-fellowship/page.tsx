import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Check } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { BrandCtaButton } from "@/components/ui/brand-cta-button"
import { buttonVariants } from "@/components/ui/button"
import { PifScrollImage } from "@/components/trainings/pif-scroll-image"
import { PifFaq } from "@/components/trainings/pif-faq"
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld"
import { JsonLd } from "@/components/seo/json-ld"
import { siteMetadata } from "@/config/brand"
import {
  pifApplyPath,
  pifCoursePath,
  pifFaqs,
  pifLearningTracks,
  pifPricing,
} from "@/config/product-innovation-fellowship"
import { createPageMetadata } from "@/lib/seo"
import { getCourseSchema, getFaqSchema } from "@/lib/structured-data"
import { cn } from "@/lib/utils"

const pagePath = pifCoursePath
const shareImage = "/pil-og.jpg"

const highlights = [
  "12 Weeks of Hands-on Learning",
  "Startup Simulation Experience",
  "Industry Mentorship",
  "Portfolio-Ready Projects",
]

const journeyPhases = [
  {
    title: "Foundation Bootcamp (4 Weeks)",
    description:
      "Learn product thinking, design, Agile, AI tools, and team collaboration.",
  },
  {
    title: "Product Innovation Lab (8 Weeks)",
    description:
      "Join a startup team to research, design, develop, test, and launch a functional MVP.",
  },
  {
    title: "Demo Day & Career Fair",
    description:
      "Present your product to industry professionals, receive expert feedback, and connect with recruiters and employers.",
  },
]

const learningTracks = [...pifLearningTracks]

const fellowshipOutcomes = [
  "A portfolio-ready product",
  "Practical product development experience",
  "Industry mentorship",
  "Startup team experience",
  "Demo Day exposure",
  "Career networking opportunities",
  "Fellowship Certificate",
  "Access to the Alumni Network",
]

const investmentIncludes = [
  "4-Week Foundation Bootcamp",
  "8-Week Product Innovation Lab",
  "Industry Mentorship",
  "Real Product Experience",
  "Demo Day & Career Fair",
  "Fellowship Certificate",
  "Alumni Community",
]

const relatedPrograms = [
  {
    label: "Tech Bootcamps",
    href: "/trainings/bootcamps",
    description: "Short intensive programs for fast skill building",
  },
  {
    label: "Corporate Training",
    href: "/trainings/corporate",
    description: "Tailored tech training for teams and organizations",
  },
  {
    label: "Individual Certifications",
    href: "/trainings/individual-certifications",
    description: "Professional certification paths for specialists",
  },
  {
    label: "Register for Training",
    href: "/trainings/register",
    description: "Browse schools and enroll in Techyx360 programs",
  },
  {
    label: "Tech Trainings Service",
    href: "/services/tech-trainings",
    description: "Hands-on training solutions for learners and businesses",
  },
  {
    label: "Contact Techyx360",
    href: "/contact",
    description: "Speak with our team about the fellowship",
  },
]

export const metadata: Metadata = createPageMetadata({
  title:
    "Product Innovation Fellowship | Build Real Products | Techyx360",
  description:
    "Join the Techyx360 Product Innovation Fellowship (PIF) — a 12-week immersive fellowship where Product Managers, UI/UX Designers, and Software Developers collaborate to build real digital products, gain mentorship, and launch portfolio-ready MVPs.",
  path: pagePath,
  ogImage: shareImage,
  ogImageAlt:
    "Product Innovation Fellowship — team building real digital products at Techyx360",
  ogImageWidth: 1200,
  ogImageHeight: 630,
  keywords: [
    "product innovation fellowship",
    "product manager training Nigeria",
    "UI UX fellowship Nigeria",
    "software developer fellowship",
    "Techyx360 PIF",
    "product development fellowship Lagos",
    "startup simulation training",
    ...siteMetadata.keywords.slice(0, 5),
  ],
})

export default function ProductInnovationFellowshipPage() {
  return (
    <main className="flex flex-1 flex-col">
      <JsonLd
        data={getCourseSchema({
          name: "Techyx360 Product Innovation Fellowship",
          description:
            "A 12-week immersive fellowship where Product Managers, UI/UX Designers, and Software Developers collaborate to build real digital products.",
          path: pagePath,
          image: shareImage,
          duration: "P12W",
          teaches: learningTracks,
        })}
      />
      <JsonLd data={getFaqSchema(pifFaqs)} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Trainings", path: "/trainings/register" },
          { name: "Product Innovation Fellowship", path: pagePath },
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
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="outline"
              className="mb-4 rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
            >
              Product Innovation Fellowship
            </Badge>

            <h1 className="text-3xl font-bold tracking-tight text-balance text-zinc-900 sm:text-4xl lg:text-5xl dark:text-foreground">
              Build Products. Gain Experience. Launch Your Career.
            </h1>

            <p className="mt-5 text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-muted-foreground">
              A 12-week immersive fellowship where aspiring Product Managers, UI/UX
              Designers, and Software Developers collaborate to build real
              digital products, learn from industry mentors, and showcase their
              work to employers.
            </p>

            <ul className="mx-auto mt-8 grid max-w-xl gap-3 text-left sm:grid-cols-2">
              {highlights.map((item) => (
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

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
              <BrandCtaButton href={pifApplyPath}>Apply Now</BrandCtaButton>
              <Link
                href="#"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-11 px-6 text-base transition-all duration-300 hover:border-brand hover:bg-brand/10 hover:text-brand active:scale-[0.98] sm:h-12"
                )}
              >
                Download Fellowship Handbook
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PifScrollImage />

      <section className="bg-[#f4f6fa] py-14 sm:py-16 lg:py-20 dark:bg-[#0f1524]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="max-w-xl lg:max-w-none">
              <Badge
                variant="outline"
                className="mb-4 rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
              >
                Why PIF?
              </Badge>

              <h2 className="text-2xl font-bold tracking-tight text-balance text-zinc-900 sm:text-3xl lg:text-4xl dark:text-foreground">
                More Than a Fellowship, A Real Product Experience
              </h2>

              <p className="mt-4 text-base font-semibold leading-relaxed text-zinc-800 sm:text-lg dark:text-foreground">
                Most training programs teach skills. PIF helps you apply them.
              </p>

              <p className="mt-4 text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-muted-foreground">
                Through structured learning, mentorship, and startup-style
                collaboration, you&apos;ll work with a multidisciplinary team to
                design, build, and launch a real digital product while gaining
                the experience employers value. Explore our{" "}
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
                for more learning paths.
              </p>
            </div>

            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl lg:aspect-[2/1]">
              <Image
                src="/pil2.png"
                alt="Product Innovation Fellowship team collaborating on research, design, development, and launch"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="outline"
              className="mb-4 inline-flex rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
            >
              How the Fellowship Works
            </Badge>

            <h2 className="text-2xl font-bold tracking-tight text-balance text-zinc-900 sm:text-3xl lg:text-4xl dark:text-foreground">
              Your Journey in Three Phases
            </h2>
          </div>

          <ol className="mt-10 grid gap-8 lg:grid-cols-3 lg:gap-10">
            {journeyPhases.map((phase, index) => (
              <li
                key={phase.title}
                className="flex flex-col items-center text-center"
              >
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-sm font-bold text-brand sm:size-11 sm:text-base"
                  aria-hidden
                >
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl dark:text-foreground">
                  {phase.title}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-zinc-600 dark:text-muted-foreground">
                  {phase.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[#f4f6fa] py-14 sm:py-16 lg:py-20 dark:bg-[#0f1524]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-14 lg:items-start">
            <div>
              <Badge
                variant="outline"
                className="mb-4 inline-flex rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
              >
                Learning Tracks
              </Badge>

              <h2 className="text-2xl font-bold tracking-tight text-balance text-zinc-900 sm:text-3xl lg:text-4xl dark:text-foreground">
                Choose the path that aligns with your career goals.
              </h2>

              <ul className="mt-8 grid grid-cols-2 gap-3">
                {learningTracks.map((track) => (
                  <li
                    key={track}
                    className="rounded-2xl border border-border/60 bg-white/90 px-4 py-3.5 text-sm font-semibold text-zinc-900 transition-colors hover:border-brand/30 dark:bg-white/5 dark:text-foreground sm:px-5 sm:text-base"
                  >
                    {track}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <Badge
                variant="outline"
                className="mb-4 inline-flex rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
              >
                What You&apos;ll Gain
              </Badge>

              <h2 className="text-2xl font-bold tracking-tight text-balance text-zinc-900 sm:text-3xl lg:text-4xl dark:text-foreground">
                By the end of the fellowship, you&apos;ll have:
              </h2>

              <ul className="mt-8 space-y-3">
                {fellowshipOutcomes.map((outcome) => (
                  <li
                    key={outcome}
                    className="flex items-start gap-2.5 text-sm font-medium text-zinc-800 sm:text-base dark:text-foreground"
                  >
                    <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
                      <Check className="size-3.5" strokeWidth={3} aria-hidden />
                    </span>
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-14 sm:py-16 lg:py-20">
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
                    {pifPricing.currentPrice}
                  </p>
                  <p className="pb-1 text-lg font-semibold text-muted-foreground line-through sm:text-xl">
                    {pifPricing.regularPrice}
                  </p>
                </div>

                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  A one-time fee for the complete 12-week Product Innovation
                  Fellowship.
                </p>

                <p className="mt-6 text-sm font-medium text-zinc-700 dark:text-foreground">
                  Flexible payment options are available.
                </p>

                <div className="mt-auto hidden border-t border-border/60 pt-6 lg:block">
                  <p className="text-base font-semibold text-zinc-900 dark:text-foreground">
                    Ready to begin your journey?
                  </p>
                  <div className="mt-4">
                    <BrandCtaButton href={pifApplyPath}>Apply Now</BrandCtaButton>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-foreground">
                  What&apos;s Included
                </h3>

                <ul className="mt-5 space-y-3">
                  {investmentIncludes.map((item) => (
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
                  Ready to begin your journey?
                </p>
                <div className="mt-4">
                  <BrandCtaButton href={pifApplyPath}>Apply Now</BrandCtaButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f4f6fa] py-14 sm:py-16 lg:py-20 dark:bg-[#0f1524]">
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
            {relatedPrograms.map((program) => (
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

      <section
        id="pif-faq"
        className="scroll-mt-24 bg-background py-14 sm:py-16 lg:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl lg:aspect-[5/4]">
              <Image
                src={shareImage}
                alt="Product Innovation Fellowship team collaborating on a digital product"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>

            <div>
              <Badge
                variant="outline"
                className="mb-4 inline-flex rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
              >
                FAQ
              </Badge>

              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl dark:text-foreground">
                Frequently Asked Questions
              </h2>

              <div className="mt-8 rounded-3xl border border-border/60 bg-card p-6 sm:p-8">
                <PifFaq />
              </div>
            </div>
          </div>
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
                Ready to Build Something That Matters?
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-white/80 sm:text-base">
                Join a community of ambitious builders, collaborate with industry
                mentors, and gain the practical experience employers value.
              </p>

              <p className="mt-4 text-sm font-medium text-[#eaaa33] sm:text-base">
                Become a Product Innovation Fellow today.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
                <BrandCtaButton href={pifApplyPath}>Apply Now</BrandCtaButton>
                <Link
                  href="/contact"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-11 border-white/30 bg-transparent px-6 text-base text-white transition-all duration-300 hover:border-white hover:bg-white/10 hover:text-white active:scale-[0.98] sm:h-12"
                  )}
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
