import Link from "next/link"
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  Clock3,
  GraduationCap,
  MapPin,
  Wallet,
} from "lucide-react"

import { ApplyCareerDialogButton } from "@/components/careers/apply-career-dialog"
import { JoinTalentPoolDialogButton } from "@/components/careers/join-talent-pool-dialog"
import { BrandCtaButton } from "@/components/ui/brand-cta-button"
import {
  formatCareerPostedAt,
  formatCareerSalaryRange,
  type CareerOpenPosition,
} from "@/config/careers"

export function CareerDetailSidebar({
  position,
  otherRoles,
}: {
  position: CareerOpenPosition
  otherRoles: CareerOpenPosition[]
}) {
  const salaryLabel = formatCareerSalaryRange(
    position.salaryMin,
    position.salaryMax
  )

  return (
    <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
      <section className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
        <p className="text-xs font-semibold tracking-[0.18em] text-brand uppercase">
          Role summary
        </p>
        <h2 className="mt-2 text-lg font-bold tracking-tight text-[#0f1524] dark:text-foreground">
          {position.title}
        </h2>

        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-2.5">
            <Briefcase className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            <span>
              <span className="font-medium text-foreground">Department:</span>{" "}
              {position.department}
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            <span>
              <span className="font-medium text-foreground">Location:</span>{" "}
              {position.location}
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <Clock3 className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            <span>
              <span className="font-medium text-foreground">Type:</span>{" "}
              {position.type}
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            <span>
              <span className="font-medium text-foreground">Posted:</span>{" "}
              {formatCareerPostedAt(position.postedAt)}
            </span>
          </li>
          {salaryLabel ? (
            <li className="flex items-start gap-2.5">
              <Wallet className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              <span>
                <span className="font-medium text-foreground">Salary:</span>{" "}
                {salaryLabel}
              </span>
            </li>
          ) : null}
        </ul>

        <div className="mt-4 flex items-center gap-2">
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            {position.status}
          </span>
        </div>

        <ApplyCareerDialogButton className="mt-5 w-full justify-center" />
      </section>

      {otherRoles.length > 0 ? (
        <section className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
          <h3 className="text-base font-semibold text-[#0f1524] dark:text-foreground">
            Other open roles
          </h3>
          <ul className="mt-4 space-y-3">
            {otherRoles.map((role) => (
              <li key={role.id}>
                <Link
                  href={`/careers/${role.id}`}
                  className="group flex items-start justify-between gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-brand/20 hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground transition-colors group-hover:text-brand">
                      {role.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {role.department} · {role.location}
                    </p>
                  </div>
                  <ArrowRight
                    className="mt-0.5 size-4 shrink-0 text-brand transition-transform duration-300 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
        <h3 className="text-base font-semibold text-[#0f1524] dark:text-foreground">
          Don&apos;t see a perfect fit?
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Send us your CV and portfolio, and we&apos;ll reach out when a suitable
          opportunity comes up.
        </p>
        <JoinTalentPoolDialogButton className="mt-4" />
      </section>

      <section className="relative overflow-hidden rounded-2xl bg-[#0f1524] p-5 text-white sm:p-6">
        <GraduationCap
          aria-hidden
          className="pointer-events-none absolute -right-3 -bottom-2 size-28 text-brand/20"
        />
        <div className="relative">
          <h3 className="text-base font-semibold">Fellowship at Techyx360</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/75">
            Kickstart your career with our Product Innovation Fellowship and
            gain real-world experience.
          </p>
          <BrandCtaButton
            href="/trainings/product-innovation-fellowship"
            className="mt-4 w-full justify-center"
          >
            View Fellowship Opportunities
          </BrandCtaButton>
        </div>
      </section>
    </aside>
  )
}
