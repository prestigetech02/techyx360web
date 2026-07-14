import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Wallet,
} from "lucide-react"

import {
  ApplyCareerDialogButton,
  ApplyCareerDialogProvider,
} from "@/components/careers/apply-career-dialog"
import { CareerDetailSidebar } from "@/components/careers/career-detail-sidebar"
import { JoinTalentPoolDialogProvider } from "@/components/careers/join-talent-pool-dialog"
import { PageHeroBackground } from "@/components/layout/page-hero-background"
import { BlogPostContent } from "@/components/blog/blog-post-content"
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld"
import { brand } from "@/config/brand"
import { formatCareerPostedAt, formatCareerSalaryRange } from "@/config/careers"
import {
  getJobOpeningBySlug,
  getOpenJobOpenings,
  getOtherOpenJobOpenings,
} from "@/lib/careers/openings"
import { createPageMetadata } from "@/lib/seo"

export const dynamicParams = true
export const revalidate = 60

export async function generateStaticParams() {
  const openings = await getOpenJobOpenings()
  return openings.map((position) => ({ id: position.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const position = await getJobOpeningBySlug(id)

  if (!position || position.status !== "Open") {
    return createPageMetadata({
      title: `Careers | ${brand.name}`,
      description: "Explore open roles at Techyx360.",
      path: "/careers",
      noIndex: true,
    })
  }

  return createPageMetadata({
    title: `${position.title} | Careers | ${brand.name}`,
    description: position.description,
    path: `/careers/${position.id}`,
    keywords: [
      `${position.title} Techyx360`,
      `${position.department} jobs Lagos`,
      "Techyx360 careers",
      "tech jobs Nigeria",
    ],
  })
}

function DetailList({
  title,
  items,
}: {
  title: string
  items: string[]
}) {
  return (
    <section>
      <h2 className="text-xl font-bold tracking-tight text-[#0f1524] sm:text-2xl dark:text-foreground">
        {title}
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-muted-foreground">
            <CheckCircle2
              className="mt-0.5 size-5 shrink-0 text-brand"
              aria-hidden
            />
            <span className="text-sm leading-relaxed sm:text-base">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default async function CareerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const position = await getJobOpeningBySlug(id)

  if (!position || position.status !== "Open") notFound()

  const otherRoles = await getOtherOpenJobOpenings(position.id)
  const salaryLabel = formatCareerSalaryRange(
    position.salaryMin,
    position.salaryMax
  )

  return (
    <JoinTalentPoolDialogProvider>
      <ApplyCareerDialogProvider
        positionId={position.id}
        positionTitle={position.title}
      >
        <main className="flex flex-1 flex-col">
        <BreadcrumbJsonLd
          items={[
            { name: "Home", path: "/" },
            { name: "Careers", path: "/careers" },
            { name: position.title, path: `/careers/${position.id}` },
          ]}
        />

        <section className="relative overflow-hidden bg-[#0f1524]">
          <PageHeroBackground />

          <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
            <nav aria-label="Breadcrumb">
              <ol className="inline-flex flex-wrap items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white/70 backdrop-blur-sm">
                <li>
                  <Link href="/" className="transition-colors hover:text-white">
                    Home
                  </Link>
                </li>
                <li aria-hidden className="text-white/40">
                  /
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="transition-colors hover:text-white"
                  >
                    Careers
                  </Link>
                </li>
                <li aria-hidden className="text-white/40">
                  /
                </li>
                <li className="max-w-[14rem] truncate text-white sm:max-w-none">
                  {position.title}
                </li>
              </ol>
            </nav>

            <div className="mt-8 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                  {position.status}
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs text-white/80">
                  {position.department}
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl lg:text-5xl">
                {position.title}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
                {position.description}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/75">
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="size-4 text-brand" aria-hidden />
                  {position.department}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 text-brand" aria-hidden />
                  {position.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-4 text-brand" aria-hidden />
                  {position.type}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4 text-brand" aria-hidden />
                  Posted {formatCareerPostedAt(position.postedAt)}
                </span>
                {salaryLabel ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Wallet className="size-4 text-brand" aria-hidden />
                    {salaryLabel}
                  </span>
                ) : null}
              </div>

              <div className="mt-8">
                <ApplyCareerDialogButton />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f4f6fa] py-12 sm:py-14 lg:py-16 dark:bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link
              href="/careers#open-positions"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-brand"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back to open positions
            </Link>

            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_24rem]">
              <article className="space-y-10 rounded-2xl border border-border/60 bg-card p-6 sm:p-8 lg:p-10">
                <section>
                  <h2 className="text-xl font-bold tracking-tight text-[#0f1524] sm:text-2xl dark:text-foreground">
                    About the role
                  </h2>
                  <div className="mt-4">
                    <BlogPostContent content={position.overview} />
                  </div>
                </section>

                <DetailList
                  title="What you'll do"
                  items={position.responsibilities}
                />
                <DetailList
                  title="What we're looking for"
                  items={position.requirements}
                />
                <DetailList title="Nice to have" items={position.niceToHave} />
                <DetailList title="What we offer" items={position.benefits} />

                <div className="rounded-2xl border border-brand/20 bg-brand/5 p-5 sm:p-6">
                  <h2 className="text-lg font-bold tracking-tight text-[#0f1524] dark:text-foreground">
                    Ready to apply?
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Complete the application form with your CV and a short note
                    about why this role is a fit. We review every application
                    that comes in.
                  </p>
                  <ApplyCareerDialogButton
                    className="mt-5"
                    label={`Apply for ${position.title}`}
                  />
                </div>
              </article>

              <CareerDetailSidebar
                position={position}
                otherRoles={otherRoles}
              />
            </div>
          </div>
        </section>
      </main>
      </ApplyCareerDialogProvider>
    </JoinTalentPoolDialogProvider>
  )
}
