"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  Code2,
  GraduationCap,
  Headset,
  PenTool,
  type LucideIcon,
} from "lucide-react"

import { BrandCtaButton } from "@/components/ui/brand-cta-button"
import { buttonVariants } from "@/components/ui/button"
import { DropdownField } from "@/components/ui/dropdown"
import { JoinTalentPoolDialogButton } from "@/components/careers/join-talent-pool-dialog"
import {
  getCareerFilterOptions,
  formatCareerPostedAt,
  formatCareerSalaryRange,
  matchesCareerDatePostedFilter,
  matchesCareerSalaryRangeFilter,
  type CareerOpenPosition,
} from "@/config/careers"
import { cn } from "@/lib/utils"

const iconMap: Record<
  CareerOpenPosition["icon"],
  { Icon: LucideIcon; className: string }
> = {
  code: { Icon: Code2, className: "bg-brand text-white" },
  design: { Icon: PenTool, className: "bg-violet-500 text-white" },
  product: { Icon: Briefcase, className: "bg-amber-500 text-white" },
  support: { Icon: Headset, className: "bg-emerald-500 text-white" },
}

type Filters = {
  department: string
  location: string
  type: string
  datePosted: string
  salaryRange: string
}

const defaultFilters: Filters = {
  department: "All Departments",
  location: "All Locations",
  type: "Job Type",
  datePosted: "any",
  salaryRange: "any",
}

function filterPositions(
  positions: CareerOpenPosition[],
  filters: Filters
) {
  return positions.filter((position) => {
    const departmentMatch =
      filters.department === "All Departments" ||
      position.department === filters.department
    const locationMatch =
      filters.location === "All Locations" ||
      position.location === filters.location
    const typeMatch =
      filters.type === "Job Type" || position.type === filters.type
    const dateMatch = matchesCareerDatePostedFilter(
      position.postedAt,
      filters.datePosted
    )
    const salaryMatch = matchesCareerSalaryRangeFilter(
      position.salaryMin,
      position.salaryMax,
      filters.salaryRange
    )

    return (
      departmentMatch &&
      locationMatch &&
      typeMatch &&
      dateMatch &&
      salaryMatch
    )
  })
}

function hasActiveFilters(filters: Filters) {
  return (
    filters.department !== defaultFilters.department ||
    filters.location !== defaultFilters.location ||
    filters.type !== defaultFilters.type ||
    filters.datePosted !== defaultFilters.datePosted ||
    filters.salaryRange !== defaultFilters.salaryRange
  )
}

export function OpenPositionsSection({
  positions: allPositions,
}: {
  positions: CareerOpenPosition[]
}) {
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [isPending, startTransition] = useTransition()

  const filterOptions = useMemo(
    () => getCareerFilterOptions(allPositions),
    [allPositions]
  )

  const departmentOptions = useMemo(
    () =>
      filterOptions.departments.map((department) => ({
        value: department,
        label: department,
      })),
    [filterOptions.departments]
  )

  const locationOptions = useMemo(
    () =>
      filterOptions.locations.map((location) => ({
        value: location,
        label: location,
      })),
    [filterOptions.locations]
  )

  const jobTypeOptions = useMemo(
    () =>
      filterOptions.jobTypes.map((type) => ({
        value: type,
        label: type,
      })),
    [filterOptions.jobTypes]
  )

  const datePostedOptions = useMemo(
    () => filterOptions.datePosted,
    [filterOptions.datePosted]
  )

  const salaryRangeOptions = useMemo(
    () => filterOptions.salaryRanges,
    [filterOptions.salaryRanges]
  )

  const positions = useMemo(
    () => filterPositions(allPositions, filters),
    [allPositions, filters]
  )

  const filtersActive = hasActiveFilters(filters)

  function updateFilter<Key extends keyof Filters>(key: Key, value: string) {
    startTransition(() => {
      setFilters((current) => ({
        ...current,
        [key]: value,
      }))
    })
  }

  function handleClearFilters() {
    startTransition(() => {
      setFilters(defaultFilters)
    })
  }

  return (
    <section
      id="open-positions"
      className="scroll-mt-24 bg-[#f4f6fa] pt-14 pb-14 sm:pt-16 sm:pb-16 lg:pt-[4.75rem] lg:pb-20 dark:bg-[#0f1524]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#0f1524] sm:text-3xl lg:text-4xl dark:text-foreground">
              Open Positions
            </h2>
            <p className="mt-2 max-w-xl text-base text-muted-foreground sm:text-lg">
              Explore exciting career opportunities and become part of our
              mission.
            </p>

            <p
              id="open-positions-results"
              className="mt-4 text-sm text-muted-foreground"
              aria-live="polite"
            >
              Showing {positions.length} of {allPositions.length} open{" "}
              {allPositions.length === 1 ? "role" : "roles"}
              {filtersActive ? " matching your filters" : ""}
            </p>

            <ul className="mt-6 space-y-4">
              {positions.length === 0 ? (
                <li className="rounded-2xl border border-border/60 bg-card px-5 py-8 text-center sm:px-6">
                  <p className="text-sm text-muted-foreground sm:text-base">
                    No roles match those filters. Try adjusting your search or
                    join our talent pool.
                  </p>
                  {filtersActive ? (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="mt-4 text-sm font-medium text-brand hover:underline"
                    >
                      Clear filters
                    </button>
                  ) : null}
                </li>
              ) : (
                positions.map((position) => {
                  const { Icon, className } = iconMap[position.icon]
                  const salaryLabel = formatCareerSalaryRange(
                    position.salaryMin,
                    position.salaryMax
                  )

                  return (
                    <li key={position.id}>
                      <Link
                        href={`/careers/${position.id}`}
                        className="group flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-4 transition-all duration-300 hover:border-brand/30 hover:shadow-md sm:items-center sm:gap-5 sm:p-5"
                      >
                        <span
                          className={cn(
                            "inline-flex size-11 shrink-0 items-center justify-center rounded-xl sm:size-12",
                            className
                          )}
                        >
                          <Icon className="size-5" aria-hidden />
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <h3 className="text-base font-semibold text-[#0f1524] sm:text-lg dark:text-foreground">
                              {position.title}
                            </h3>
                            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                              {position.status}
                            </span>
                          </div>

                          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground sm:gap-x-3 sm:text-sm">
                            <span>{position.department}</span>
                            <span aria-hidden className="text-border">
                              |
                            </span>
                            <span>{position.location}</span>
                            <span aria-hidden className="text-border">
                              |
                            </span>
                            <span>{position.type}</span>
                            <span aria-hidden className="text-border">
                              |
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="size-3.5" aria-hidden />
                              Posted {formatCareerPostedAt(position.postedAt)}
                            </span>
                          </p>

                          {salaryLabel ? (
                            <p className="mt-1.5 text-sm font-medium text-[#0f1524] dark:text-foreground">
                              {salaryLabel}
                            </p>
                          ) : null}
                        </div>

                        <ArrowRight
                          className="mt-1 hidden size-5 shrink-0 text-brand transition-transform duration-300 group-hover:translate-x-0.5 sm:mt-0 sm:block"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  )
                })
              )}
            </ul>

            {filtersActive ? (
              <button
                type="button"
                onClick={handleClearFilters}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "mt-6 h-11 gap-2 border-brand/40 px-5 text-base text-brand transition-all duration-300 hover:border-brand hover:bg-brand/10 hover:text-brand active:scale-[0.98] sm:h-12"
                )}
              >
                View All Open Positions
                <ArrowRight className="size-4" aria-hidden />
              </button>
            ) : null}
          </div>

          <aside className="flex flex-col gap-4 sm:gap-5">
            <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
              <h3 className="text-base font-semibold text-[#0f1524] dark:text-foreground">
                Find the right role for you
              </h3>

              <div className="mt-4 space-y-3">
                <DropdownField
                  id="career-department"
                  placeholder="All Departments"
                  options={departmentOptions}
                  value={filters.department}
                  onValueChange={(value) =>
                    updateFilter("department", value ?? "All Departments")
                  }
                  className="h-11 w-full"
                />
                <DropdownField
                  id="career-location"
                  placeholder="All Locations"
                  options={locationOptions}
                  value={filters.location}
                  onValueChange={(value) =>
                    updateFilter("location", value ?? "All Locations")
                  }
                  className="h-11 w-full"
                />
                <DropdownField
                  id="career-type"
                  placeholder="Job Type"
                  options={jobTypeOptions}
                  value={filters.type}
                  onValueChange={(value) =>
                    updateFilter("type", value ?? "Job Type")
                  }
                  className="h-11 w-full"
                />
                <DropdownField
                  id="career-date-posted"
                  placeholder="Any time"
                  options={datePostedOptions}
                  value={filters.datePosted}
                  onValueChange={(value) =>
                    updateFilter("datePosted", value ?? "any")
                  }
                  className="h-11 w-full"
                />
                <DropdownField
                  id="career-salary-range"
                  placeholder="Any salary"
                  options={salaryRangeOptions}
                  value={filters.salaryRange}
                  onValueChange={(value) =>
                    updateFilter("salaryRange", value ?? "any")
                  }
                  className="h-11 w-full"
                />
              </div>

              <div className="mt-4 grid gap-2">
                <button
                  type="button"
                  onClick={() => {
                    document
                      .getElementById("open-positions-results")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }}
                  disabled={isPending}
                  className={cn(
                    buttonVariants(),
                    "h-11 w-full bg-brand text-base text-brand-foreground transition-all duration-300 hover:bg-[#eaaa33] hover:text-[#1a1408] active:scale-[0.98] disabled:opacity-70 sm:h-12"
                  )}
                >
                  {filtersActive
                    ? `Show ${positions.length} Result${positions.length === 1 ? "" : "s"}`
                    : "Browse Open Roles"}
                </button>

                {filtersActive ? (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "h-11 w-full border-brand/40 text-base text-brand transition-all duration-300 hover:border-brand hover:bg-brand/10 hover:text-brand active:scale-[0.98] sm:h-12"
                    )}
                  >
                    Clear Filters
                  </button>
                ) : null}
              </div>
            </div>

            <div
              id="talent-pool"
              className="scroll-mt-24 rounded-2xl border border-border/60 bg-card p-5 sm:p-6"
            >
              <h3 className="text-base font-semibold text-[#0f1524] dark:text-foreground">
                Don&apos;t see a perfect fit?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Send us your CV and portfolio, and we&apos;ll reach out when a
                suitable opportunity comes up.
              </p>
              <JoinTalentPoolDialogButton />
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-[#0f1524] p-5 text-white sm:p-6">
              <GraduationCap
                aria-hidden
                className="pointer-events-none absolute -right-3 -bottom-2 size-28 text-brand/20"
              />
              <div className="relative">
                <h3 className="text-base font-semibold">
                  Fellowship at Techyx360
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">
                  Kickstart your career with our Product Innovation Fellowship
                  and gain real-world experience.
                </p>
                <BrandCtaButton
                  href="/trainings/product-innovation-fellowship"
                  className="mt-4 w-full justify-center"
                >
                  View Fellowship Opportunities
                </BrandCtaButton>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
