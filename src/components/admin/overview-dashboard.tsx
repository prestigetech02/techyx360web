"use client"

import Link from "next/link"
import {
  ArrowUpRight,
  BriefcaseBusiness,
  GraduationCap,
  LayoutDashboard,
  Mail,
  Rocket,
  Users,
  UsersRound,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { AdminDashboardData } from "@/lib/admin/dashboard"
import { cn } from "@/lib/utils"

const kpiIcons = {
  registrations: GraduationCap,
  contacts: Mail,
  leads: Users,
  pif: Rocket,
  careers: BriefcaseBusiness,
  clients: UsersRound,
} as const

const pipelineColors: Record<string, string> = {
  new: "#2563eb",
  contacted: "#0d9488",
  qualified: "#ca8a04",
  converted: "#059669",
  lost: "#94a3b8",
}

const quickLinks = [
  { label: "Leads", href: "/admin/leads", description: "Pipeline & outreach" },
  { label: "Clients", href: "/admin/clients", description: "Accounts" },
  {
    label: "Registrations",
    href: "/admin/registrations",
    description: "Courses & SIWES",
  },
  { label: "Contact", href: "/admin/contact", description: "Enquiries" },
  {
    label: "PIF",
    href: "/admin/submissions/pif-applications",
    description: "Fellowship apps",
  },
  {
    label: "Careers",
    href: "/admin/job-applications",
    description: "Job applications",
  },
]

function formatRelativeTime(iso: string) {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diffSec = Math.max(0, Math.floor((now - then) / 1000))

  if (diffSec < 60) return "Just now"
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name?: string; value?: number; color?: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-xl border border-border/70 bg-card px-3 py-2 text-xs shadow-lg">
      {label ? (
        <p className="mb-1.5 font-medium text-foreground">{label}</p>
      ) : null}
      <div className="space-y-1">
        {payload.map((entry) => (
          <div
            key={entry.name}
            className="flex items-center justify-between gap-4"
          >
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-semibold tabular-nums text-foreground">
              {entry.value ?? 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function OverviewDashboard({ data }: { data: AdminDashboardData }) {
  const trendTotal = data.trend.reduce((sum, point) => sum + point.total, 0)
  const converted =
    data.leadPipeline.find((item) => item.status === "converted")?.count ?? 0
  const conversionRate =
    data.kpis.find((k) => k.key === "leads")?.value &&
    (data.kpis.find((k) => k.key === "leads")?.value ?? 0) > 0
      ? Math.round(
          (converted /
            (data.kpis.find((k) => k.key === "leads")?.value ?? 1)) *
            100
        )
      : 0

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            Overview
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Activity across CRM, submissions, and applications — at a glance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-sm">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Needs attention
            </p>
            <p className="mt-0.5 text-xl font-bold tabular-nums text-foreground">
              {data.unreadTotal}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-sm">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              30-day volume
            </p>
            <p className="mt-0.5 text-xl font-bold tabular-nums text-foreground">
              {trendTotal}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-sm">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Lead win rate
            </p>
            <p className="mt-0.5 text-xl font-bold tabular-nums text-foreground">
              {conversionRate}%
            </p>
          </div>
        </div>
      </div>

      {!data.configured ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 px-5 py-8 text-center text-sm text-muted-foreground">
          Connect Supabase to populate live dashboard metrics.
        </div>
      ) : null}

      <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 @5xl:grid-cols-6">
        {data.kpis.map((kpi) => {
          const Icon =
            kpiIcons[kpi.key as keyof typeof kpiIcons] ?? LayoutDashboard
          return (
            <Link
              key={kpi.key}
              href={kpi.href}
              className="group rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-colors hover:border-brand/40 hover:bg-brand/[0.03]"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex size-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="size-4" />
                </span>
                <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="mt-4 text-2xl font-bold tabular-nums text-foreground">
                {kpi.value}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {kpi.label}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{kpi.hint}</p>
            </Link>
          )
        })}
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-5">
        <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5 lg:col-span-3">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Activity trend
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                New items over the last 30 days
              </p>
            </div>
          </div>
          <div className="h-64 w-full min-w-0 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.trend}
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  className="text-border/60"
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={28}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-muted-foreground"
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-muted-foreground"
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#trendFill)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5 lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              Inbox mix
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Share of all tracked submissions
            </p>
          </div>
          <div className="h-52 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.inboxBreakdown}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {data.inboxBreakdown.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-2">
            {data.inboxBreakdown
              .filter((item) => item.key !== "empty")
              .map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between gap-3 rounded-lg px-1 py-0.5 text-xs transition-colors hover:bg-muted/50"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate">{item.label}</span>
                    </span>
                    <span className="font-semibold tabular-nums text-foreground">
                      {item.value}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-5">
        <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5 lg:col-span-3">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Lead pipeline
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Distribution by CRM status
              </p>
            </div>
            <Link
              href="/admin/leads"
              className="text-xs font-medium text-brand hover:underline"
            >
              Open leads
            </Link>
          </div>
          <div className="h-56 w-full min-w-0 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.leadPipeline}
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  className="text-border/60"
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-muted-foreground"
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-muted-foreground"
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Leads" radius={[8, 8, 4, 4]}>
                  {data.leadPipeline.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={pipelineColors[entry.status] ?? "#64748b"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5 lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              Lead sources
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Top channels in the pipeline
            </p>
          </div>
          {data.leadSources.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No lead sources yet.
            </p>
          ) : (
            <div className="space-y-3">
              {data.leadSources.map((source) => {
                const max = data.leadSources[0]?.value || 1
                const width = Math.max(8, Math.round((source.value / max) * 100))
                return (
                  <div key={source.key}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                      <span className="truncate text-muted-foreground">
                        {source.label}
                      </span>
                      <span className="font-semibold tabular-nums text-foreground">
                        {source.value}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-[width]"
                        style={{
                          width: `${width}%`,
                          backgroundColor: source.color,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-5">
        <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5 lg:col-span-3">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Recent activity
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Latest submissions and leads
              </p>
            </div>
          </div>
          {data.recentActivity.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nothing new yet.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {data.recentActivity.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="flex items-start justify-between gap-3 py-3 transition-colors hover:bg-muted/30"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">
                          {item.title}
                        </span>
                        <span
                          className={cn(
                            "rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                            "bg-muted text-muted-foreground"
                          )}
                        >
                          {item.type}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {item.subtitle}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5 lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              Quick links
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Jump into common workflows
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl border border-border/50 bg-muted/20 px-3 py-3 transition-colors hover:border-brand/35 hover:bg-brand/[0.04]"
              >
                <p className="text-sm font-medium text-foreground">
                  {link.label}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {link.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
