import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  Building2,
  Check,
  Code2,
  LayoutGrid,
  Megaphone,
  RefreshCw,
  Shield,
} from "lucide-react"

import { RequestTrainingDialog } from "@/components/trainings/request-training-dialog"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { brand, siteMetadata } from "@/config/brand"
import { createPageMetadata } from "@/lib/seo"
import { cn } from "@/lib/utils"

const heroImage = "/corp.hero.webp"

const trainingSolutions = [
  {
    title: "Digital Transformation Training",
    description:
      "Help teams adapt to new technologies and digital workflows.",
    icon: RefreshCw,
  },
  {
    title: "Software & Web Development",
    description:
      "Practical training on modern development tools, frameworks, and best practices.",
    icon: Code2,
  },
  {
    title: "Cybersecurity Awareness",
    description:
      "Equip employees with the skills to identify and prevent security threats.",
    icon: Shield,
  },
  {
    title: "Digital Marketing",
    description:
      "Train teams to improve online visibility, customer engagement, and lead generation.",
    icon: Megaphone,
  },
  {
    title: "Productivity & Business Tools",
    description:
      "Maximize efficiency with training on modern workplace technologies and collaboration platforms.",
    icon: LayoutGrid,
  },
  {
    title: "Custom Corporate Programs",
    description:
      "Tailored training solutions designed around your organization's goals and requirements.",
    icon: Building2,
  },
]

const whyChooseUs = [
  "Industry-focused training programs",
  "Practical, hands-on learning approach",
  "Experienced trainers and facilitators",
  "Customized training for teams and organizations",
  "Flexible onsite and virtual training options",
]

const teamBenefits = [
  "Improved productivity and performance",
  "Enhanced technical capabilities",
  "Increased employee confidence",
  "Better adoption of modern technologies",
  "Stronger security awareness",
  "Greater business efficiency",
]

export const metadata: Metadata = createPageMetadata({
  title: `Corporate Training | ${brand.name} - Tech Skills for Teams`,
  description:
    "Equip your workforce with practical, tailored corporate technology training programs that improve productivity, embrace innovation, and drive business growth.",
  path: "/trainings/corporate",
  keywords: [
    "corporate training",
    "corporate tech training Nigeria",
    "workforce technology training",
    ...siteMetadata.keywords.slice(0, 5),
  ],
})

export default function CorporateTrainingPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-[#f4f6fa] py-14 sm:py-16 lg:py-20 dark:bg-[#0f1524]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="relative aspect-square w-full max-w-md justify-self-center lg:max-w-none">
              <Image
                src={heroImage}
                alt="Corporate technology training illustration"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain object-center"
                priority
              />
            </div>

            <div className="max-w-xl lg:max-w-none">
              <Badge
                variant="outline"
                className="mb-4 rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
              >
                Corporate Training Services
              </Badge>

              <h1 className="text-3xl font-bold tracking-tight text-balance text-zinc-900 sm:text-4xl lg:text-5xl dark:text-foreground">
                Empower Your Team With Future-Ready Tech Skills
              </h1>

              <p className="mt-4 text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-muted-foreground">
                Equip your workforce with the knowledge and practical skills
                needed to improve productivity, embrace innovation, and drive
                business growth through tailored corporate training programs.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <RequestTrainingDialog />
                <Link
                  href="/contact"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-11 px-6 text-base transition-all duration-300 hover:border-brand hover:bg-brand/10 hover:text-brand active:scale-[0.98] sm:h-12"
                  )}
                >
                  Speak With Our Team
                </Link>
              </div>
            </div>
          </div>

          <div className="relative mt-12 overflow-hidden sm:mt-14 lg:mt-16">
            <Image
              src="/hero-element.svg"
              alt=""
              aria-hidden
              width={360}
              height={360}
              className="pointer-events-none absolute -top-10 -right-16 z-0 h-52 w-52 select-none scale-x-[-1] object-contain opacity-[0.28] sm:-top-12 sm:-right-20 sm:h-60 sm:w-60 lg:-top-8 lg:-right-24 lg:h-72 lg:w-72 dark:opacity-[0.4]"
            />

            <div className="relative z-10 max-w-2xl">
              <Badge
                variant="outline"
                className="mb-4 rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
              >
                Training Solutions
              </Badge>

              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl dark:text-foreground">
                Customized Training for Modern Businesses
              </h2>
            </div>

            <div className="relative z-10 mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {trainingSolutions.map((solution) => (
              <article
                key={solution.title}
                className="group rounded-2xl border border-border/60 bg-white/90 p-5 transition-colors hover:border-brand/30 dark:bg-white/5 sm:p-6"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors duration-300 [perspective:600px] group-hover:bg-brand">
                  <solution.icon
                    className="size-5 transition-all duration-500 ease-in-out [transform-style:preserve-3d] group-hover:rotate-y-180 group-hover:text-white"
                    aria-hidden
                  />
                </span>

                <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-foreground">
                  {solution.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {solution.description}
                </p>
              </article>
            ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            <article className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8">
              <Badge
                variant="outline"
                className="mb-4 rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
              >
                Why Techyx360
              </Badge>

              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-foreground">
                Why Organizations Choose Us
              </h2>

              <ul className="mt-6 space-y-4">
                {whyChooseUs.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                      <Check className="size-3.5" aria-hidden />
                    </span>
                    <span className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8">
              <Badge
                variant="outline"
                className="mb-4 rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
              >
                Benefits
              </Badge>

              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-foreground">
                What Your Team Gains
              </h2>

              <ul className="mt-6 space-y-4">
                {teamBenefits.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                      <Check className="size-3.5" aria-hidden />
                    </span>
                    <span className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

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
                Invest in Your Team&apos;s Growth
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-white/80 sm:text-base">
                Empower your employees with practical skills and industry
                knowledge that drive innovation, performance, and long-term
                success.
              </p>

              <div className="mt-8 flex justify-center">
                <RequestTrainingDialog label="Schedule a Training Consultation" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
