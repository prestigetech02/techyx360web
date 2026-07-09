import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import {
  ApplySiwesDialogButton,
  ApplySiwesDialogProvider,
} from "@/components/trainings/apply-siwes-dialog"
import { SiwesItInfo } from "@/components/trainings/siwes-it-info"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { siteMetadata } from "@/config/brand"
import { createPageMetadata } from "@/lib/seo"
import { cn } from "@/lib/utils"

const heroImage = "/77033d0b-9ed4-49d8-86fe-1fdc7865e835.png"

export const metadata: Metadata = createPageMetadata({
  title: "SIWES & Industrial Training Program | Techyx360 Technologies",
  description:
    "Join Techyx360's SIWES and Industrial Training program to gain hands-on experience in software development, UI/UX design, digital marketing, product management, and AI automation.",
  path: "/trainings/siwes-it",
  keywords: [
    "SIWES training Nigeria",
    "industrial training program",
    "IT placement training",
    "student tech internship",
    ...siteMetadata.keywords.slice(0, 5),
  ],
})

export default function SiwesItPage() {
  return (
    <ApplySiwesDialogProvider>
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
            <div className="max-w-xl lg:max-w-none">
              <Badge
                variant="outline"
                className="mb-4 rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
              >
                SIWES / Industrial Training Program
              </Badge>

              <h1 className="text-3xl font-bold tracking-tight text-balance text-zinc-900 sm:text-4xl lg:text-5xl dark:text-foreground">
                Gain Real-World Tech Experience That Sets You Apart
              </h1>

              <p className="mt-4 text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-muted-foreground">
                Bridge the gap between classroom learning and industry practice
                through hands-on training, mentorship, and real project
                experience.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ApplySiwesDialogButton label="Apply for SIWES" />
                <Link
                  href="/contact"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-11 px-6 text-base transition-all duration-300 hover:border-brand hover:bg-brand/10 hover:text-brand active:scale-[0.98] sm:h-12"
                  )}
                >
                  Contact Us
                </Link>
              </div>
            </div>

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-tr-xl rounded-br-xl rounded-tl-[3rem] rounded-bl-[3rem] lg:aspect-[5/4]">
              <Image
                src={heroImage}
                alt="SIWES and industrial training program"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-top"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <SiwesItInfo />

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
                Ready to Start Your Industrial Training Journey?
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-white/80 sm:text-base">
                Gain practical experience, develop valuable skills, and prepare
                for future career opportunities with Techyx360.
              </p>

              <div className="mt-8 flex justify-center">
                <ApplySiwesDialogButton label="Apply for SIWES/IT" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    </ApplySiwesDialogProvider>
  )
}
