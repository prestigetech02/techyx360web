import { Check } from "lucide-react"

import { Badge } from "@/components/ui/badge"

const programBenefits = [
  "Hands-on project experience",
  "Industry mentorship",
  "Practical technical skills",
  "Professional workplace exposure",
  "Portfolio-building opportunities",
  "Certificate of Completion",
]

const applicantAudiences = [
  "SIWES Students",
  "Industrial Training Students",
  "Polytechnic Students",
  "University Undergraduates",
  "Recent Graduates Seeking Experience",
]

export function SiwesItInfo() {
  return (
    <section className="bg-background py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <article className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8">
            <Badge
              variant="outline"
              className="mb-4 rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
            >
              What You&apos;ll Gain
            </Badge>

            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-foreground">
              Program Benefits
            </h2>

            <ul className="mt-6 space-y-4">
              {programBenefits.map((item) => (
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
              Applicants
            </Badge>

            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-foreground">
              Who Can Apply?
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              This program is ideal for:
            </p>

            <ul className="mt-6 space-y-4">
              {applicantAudiences.map((item) => (
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
  )
}
