"use client"

import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { CalendarCheck2, ChartColumn, Unlock, Users } from "lucide-react"

import type {
  PifAttendanceRecordView,
  PifAttendanceSummary,
} from "@/lib/pif/attendance-types"
import type { PifTeamView } from "@/lib/pif/team-types"
import { cn } from "@/lib/utils"

type Props = {
  summary: PifAttendanceSummary
  history: PifAttendanceRecordView[]
  teams: PifTeamView[]
}

const chartColors = ["#0f766e", "#0369a1", "#b45309", "#7c3aed", "#be123c"]

const fieldClassName =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
const labelClassName = "mb-1.5 block text-xs font-medium text-foreground"

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  accent: string
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${accent}`}
        >
          <Icon className="size-5" aria-hidden />
        </div>
      </div>
    </div>
  )
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value?: number | string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground">{label}</p>
      <p className="mt-0.5 text-muted-foreground">{payload[0]?.value} marks</p>
    </div>
  )
}

export function PifAttendanceAdminPanel({ summary, history, teams }: Props) {
  const [teamFilter, setTeamFilter] = useState("all")
  const [weekFilter, setWeekFilter] = useState("all")

  const weekOptions = useMemo(() => {
    const weeks = new Set<number>()
    for (const row of history) {
      if (typeof row.weekNumber === "number") weeks.add(row.weekNumber)
    }
    for (const row of summary.byWeek) weeks.add(row.week)
    return [...weeks].sort((a, b) => a - b)
  }, [history, summary.byWeek])

  const filteredHistory = useMemo(() => {
    return history.filter((row) => {
      if (teamFilter !== "all" && row.teamId !== teamFilter) return false
      if (
        weekFilter !== "all" &&
        String(row.weekNumber ?? "") !== weekFilter
      ) {
        return false
      }
      return true
    })
  }, [history, teamFilter, weekFilter])

  const teamChart = summary.byTeam.map((row) => ({
    label: row.teamName,
    count: row.count,
  }))
  const weekChart = summary.byWeek.map((row) => ({
    label: `W${row.week}`,
    count: row.count,
  }))

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
          Product Innovation Fellowship
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          Attendance
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          History, stats, and summary. Open or close attendance from each team.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total marks"
          value={summary.totalMarks}
          icon={CalendarCheck2}
          accent="bg-brand/10 text-brand"
        />
        <StatCard
          label="Marked today"
          value={summary.todayMarks}
          icon={Users}
          accent="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
        />
        <StatCard
          label="Teams open now"
          value={summary.openTeams}
          icon={Unlock}
          accent="bg-sky-500/10 text-sky-700 dark:text-sky-400"
        />
        <StatCard
          label="Teams with marks"
          value={summary.teamsWithMarks}
          icon={ChartColumn}
          accent="bg-amber-500/10 text-amber-700 dark:text-amber-400"
        />
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
          <h2 className="text-sm font-semibold text-foreground">
            Marks by team
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            All-time attendance marks per team
          </p>
          {teamChart.length > 0 ? (
            <div className="mt-4 h-56 w-full min-w-0 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={teamChart}
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
                  <Bar dataKey="count" name="Marks" radius={[8, 8, 4, 4]}>
                    {teamChart.map((entry, index) => (
                      <Cell
                        key={entry.label}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              No attendance data yet.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
          <h2 className="text-sm font-semibold text-foreground">
            Marks by week
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Distribution across program weeks
          </p>
          {weekChart.length > 0 ? (
            <div className="mt-4 h-56 w-full min-w-0 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weekChart}
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
                  <Bar
                    dataKey="count"
                    name="Marks"
                    fill="#0f766e"
                    radius={[8, 8, 4, 4]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              No weekly data yet.
            </p>
          )}
        </section>
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Attendance history
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Showing {filteredHistory.length} of {history.length} mark
                {history.length === 1 ? "" : "s"}.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:w-[28rem]">
              <div>
                <label className={labelClassName} htmlFor="history-team">
                  Team
                </label>
                <select
                  id="history-team"
                  value={teamFilter}
                  onChange={(event) => setTeamFilter(event.target.value)}
                  className={cn(fieldClassName, "bg-background")}
                >
                  <option value="all">All teams</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClassName} htmlFor="history-week">
                  Week
                </label>
                <select
                  id="history-week"
                  value={weekFilter}
                  onChange={(event) => setWeekFilter(event.target.value)}
                  className={cn(fieldClassName, "bg-background")}
                >
                  <option value="all">All weeks</option>
                  {weekOptions.map((week) => (
                    <option key={week} value={String(week)}>
                      Week {week}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {filteredHistory.length > 0 ? (
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <th className="px-6 py-3">Fellow</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-6 py-3">Marked at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredHistory.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">
                        {record.fellowName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {record.fellowEmail}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-foreground/80">
                      {record.teamName || "—"}
                    </td>
                    <td className="px-4 py-4 text-foreground/80">
                      {record.sessionLabel}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {record.attendanceDate}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {record.markedAtLabel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            {history.length === 0
              ? "No attendance marks yet. Open a team's attendance to start collecting."
              : "No marks match these filters."}
          </div>
        )}
      </div>
    </div>
  )
}
