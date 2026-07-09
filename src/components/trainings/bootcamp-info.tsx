import { Check } from "lucide-react"

import { Badge } from "@/components/ui/badge"

const bootcampBenefits = [
  "Short and intensive learning",
  "Beginner-friendly",
  "Hands-on practical sessions",
  "Industry-relevant skills",
  "Experienced facilitators",
  "Certificate of Participation",
  "Physical and virtual options",
]

const bootcampAudiences = [
  "Students",
  "Professionals",
  "Entrepreneurs",
  "Job Seekers",
  "Business Owners",
  "Freelancers",
  "Parents Looking for Tech Programs for Their Children",
]

export function BootcampInfo() {
  return (
    <section className="bg-[#f4f6fa] py-14 sm:py-16 lg:py-20 dark:bg-[#0f1524]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <article className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8">
            <Badge
              variant="outline"
              className="mb-4 rounded-full border-brand/30 bg-brand/10 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase md:text-xs"
            >
              Benefits
            </Badge>

            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-foreground">
              Why Join Our Bootcamps?
            </h2>

            <ul className="mt-6 space-y-4">
              {bootcampBenefits.map((item) => (
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
              Audience
            </Badge>

            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-foreground">
              Who Is It For?
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Perfect for:
            </p>

            <ul className="mt-6 space-y-4">
              {bootcampAudiences.map((item) => (
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
