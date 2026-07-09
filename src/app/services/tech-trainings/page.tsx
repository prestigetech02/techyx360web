import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowUpRight,
  Building2,
  ChevronRightIcon,
  Code2,
  Globe,
  Megaphone,
  PhoneIcon,
  Shield,
  Smartphone,
} from "lucide-react"

import { navigation } from "@/config/navigation"
import { siteMetadata } from "@/config/brand"
import { createPageMetadata } from "@/lib/seo"
import { ServicePageHero } from "@/components/services/service-page-hero"
import { BrandCtaButton } from "@/components/ui/brand-cta-button"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const sideImage =
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1400&q=80"

const servicesMenu =
  navigation.find((item) => item.label === "Services")?.children ?? []

const currentHref = "/services/tech-trainings"

const whyChooseUs = [
  "Custom-built solutions",
  "Modern technologies",
  "Scalable architecture",
  "Reliable support",
]

const trainingAreas = [
  {
    title: "Software Development",
    description:
      "Learn modern programming and application development practices.",
    icon: Code2,
  },
  {
    title: "Web Development",
    description:
      "Master the skills needed to build responsive and interactive websites.",
    icon: Globe,
  },
  {
    title: "Mobile App Development",
    description:
      "Develop mobile applications for Android and iOS platforms.",
    icon: Smartphone,
  },
  {
    title: "Digital Marketing",
    description:
      "Learn strategies for growing brands and reaching customers online.",
    icon: Megaphone,
  },
  {
    title: "Cybersecurity Fundamentals",
    description:
      "Understand how to protect systems, networks, and data from threats.",
    icon: Shield,
  },
  {
    title: "Corporate Training",
    description:
      "Customized technology training programs for organizations and teams.",
    icon: Building2,
  },
]

export const metadata: Metadata = createPageMetadata({
  title: "Tech Training Services | Techyx360 Technologies",
  description:
    "Build in-demand technology skills with practical training programs in software development, web development, mobile apps, digital marketing, and cybersecurity.",
  path: "/services/tech-trainings",
  keywords: [
    "tech training",
    "software development training",
    "web development courses",
    "mobile app development training",
    "cybersecurity training",
    "corporate tech training",
    ...siteMetadata.keywords.slice(0, 5),
  ],
})

export default function TechTrainingsPage() {
  return (
    <main className="flex flex-1 flex-col">
      <ServicePageHero
        title="Tech Trainings"
        breadcrumbLabel="Tech Trainings"
        path="/services/tech-trainings"
      />

      <section className="bg-[#f4f6fa] py-14 sm:py-16 lg:py-20 dark:bg-[#0f1524]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-8 lg:grid-cols-[6fr_3fr]">
            <div className="flex flex-col gap-10 lg:gap-12">
              <div className="relative h-[320px] w-full overflow-hidden rounded-3xl sm:h-[420px] lg:h-[460px]">
                <Image
                  src={sideImage}
                  alt="Technology training and skills development session"
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
              </div>

              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl dark:text-foreground">
                  Build In-Demand Tech Skills for the Future
                </h2>

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  We provide practical, industry-focused technology training
                  designed to help individuals, teams, and organizations stay
                  competitive in a rapidly evolving digital world.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <BrandCtaButton href="/contact">Enroll Now</BrandCtaButton>
                  <Link
                    href="/contact"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "h-11 px-6 text-base transition-all duration-300 hover:border-brand hover:bg-brand/10 hover:text-brand active:scale-[0.98] sm:h-12"
                    )}
                  >
                    Request Training
                  </Link>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase md:text-sm">
                  What We Offer
                </p>

                <h3 className="mt-3 text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl dark:text-foreground">
                  Available Courses
                </h3>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {trainingAreas.map((area) => (
                    <div
                      key={area.title}
                      className="rounded-2xl border border-border/60 bg-white/90 p-5 transition-colors hover:border-brand/30 dark:bg-white/5"
                    >
                      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                        <area.icon className="size-5" aria-hidden />
                      </span>

                      <h4 className="mt-4 text-base font-semibold text-zinc-900 dark:text-foreground">
                        {area.title}
                      </h4>

                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {area.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-brand/20 bg-gradient-to-br from-brand/10 via-brand/5 to-transparent p-6 sm:p-8">
                <h3 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl dark:text-foreground">
                  Ready to Advance Your Tech Skills?
                </h3>

                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Join our training programs and gain the knowledge you need to
                  thrive in today&apos;s digital economy.
                </p>

                <BrandCtaButton href="/contact" className="mt-6">
                  Enroll Today
                </BrandCtaButton>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-l border-brand/25 pl-6">
              {servicesMenu.map((item) => {
                const isActive = item.href === currentHref

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center justify-between rounded-2xl border px-5 py-4 text-sm font-medium transition-colors",
                      isActive
                        ? "border-brand/50 bg-brand/10 text-brand"
                        : "border-border/60 bg-white/90 text-zinc-800 hover:bg-white dark:bg-white/5 dark:text-zinc-100",
                      !isActive && "hover:border-brand/30"
                    )}
                  >
                    <span>{item.label}</span>

                    <span className="relative flex size-5 items-center justify-center">
                      <span
                        className={cn(
                          "transition-opacity duration-200",
                          isActive ? "hidden" : "block group-hover:hidden"
                        )}
                      >
                        <ArrowUpRight className="size-5 text-brand" />
                      </span>

                      <span
                        className={cn(
                          "absolute inset-0 transition-opacity duration-200",
                          isActive ? "block" : "hidden group-hover:block"
                        )}
                      >
                        <ChevronRightIcon className="size-5 text-brand" />
                      </span>
                    </span>
                  </Link>
                )
              })}

              <div className="mt-2 rounded-3xl bg-white/90 p-6 shadow-sm ring-1 ring-border/60 backdrop-blur-sm dark:bg-white/5">
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Why Choose Us
                </h2>

                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-700 marker:text-brand dark:text-zinc-200/90">
                  {whyChooseUs.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl bg-white/90 p-6 shadow-sm ring-1 ring-border/60 backdrop-blur-sm dark:bg-white/5">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Have questions?
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200/90">
                  Have an enquiry or you want to schedule a free consultation or
                  call back?
                </p>

                <Link
                  href="/contact"
                  className="mt-6 inline-flex h-12 items-center justify-center gap-3 rounded-xl bg-brand px-6 text-base font-semibold text-brand-foreground transition-colors hover:bg-[#eaaa33] hover:text-[#1a1408]"
                >
                  <PhoneIcon className="size-5" aria-hidden />
                  Contact Us!
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
