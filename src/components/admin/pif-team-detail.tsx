"use client"

import { useState, useTransition, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Lock,
  Unlock,
  UsersRound,
} from "lucide-react"

import { PifOpenAttendanceDialog } from "@/components/admin/pif-open-attendance-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { PifSessionRoster } from "@/lib/pif/attendance-types"
import { formatTeamSessionLabel, type PifTeamView } from "@/lib/pif/team-types"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

type FellowRow = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  status: string
  preferred_track: string
}

type Props = {
  team: PifTeamView
  fellows: FellowRow[]
  roster: PifSessionRoster | null
}

const fieldClassName =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
const labelClassName = "mb-1.5 block text-xs font-medium text-foreground"
const textareaClassName = cn(
  fieldClassName,
  "min-h-[80px] resize-y py-2.5 leading-relaxed"
)

export function PifTeamDetail({ team, fellows, roster }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [name, setName] = useState(team.name)
  const [cohortLabel, setCohortLabel] = useState(team.cohortLabel)
  const [description, setDescription] = useState(team.description)
  const [currentWeek, setCurrentWeek] = useState(String(team.currentWeek))
  const [currentDay, setCurrentDay] = useState(String(team.currentDay))

  async function saveTeam(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/pif-teams/${team.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          cohortLabel,
          description,
          currentWeek: Number(currentWeek) || 1,
          currentDay: Number(currentDay) || 1,
        }),
      })
      const data = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      if (!response.ok) {
        notify.error(data?.error ?? "Unable to save team.")
        return
      }
      notify.success("Team saved.")
      startTransition(() => router.refresh())
    } catch {
      notify.error("Unable to save team.")
    } finally {
      setSaving(false)
    }
  }

  async function setAttendance(
    attendanceOpen: boolean,
    week: number,
    day: number
  ) {
    setToggling(true)
    try {
      const response = await fetch(`/api/admin/pif-teams/${team.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendanceOpen,
          currentWeek: week,
          currentDay: day,
        }),
      })
      const data = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      if (!response.ok) {
        notify.error(data?.error ?? "Unable to update attendance.")
        return
      }
      notify.success(
        attendanceOpen
          ? `Attendance open · ${formatTeamSessionLabel(week, day, team.name)}`
          : "Attendance closed."
      )
      setOpenDialog(false)
      setCurrentWeek(String(week))
      setCurrentDay(String(day))
      startTransition(() => router.refresh())
    } catch {
      notify.error("Unable to update attendance.")
    } finally {
      setToggling(false)
    }
  }

  function handleAttendanceClick() {
    if (team.attendanceOpen) {
      void setAttendance(
        false,
        Number(currentWeek) || team.currentWeek,
        Number(currentDay) || team.currentDay
      )
      return
    }
    setOpenDialog(true)
  }

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <Link
          href="/admin/programs/pif/teams"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to teams
        </Link>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
              Product Innovation Fellowship
            </p>
            <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
              {team.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {team.sessionLabel}
            </p>
          </div>
          <Badge
            className={cn(
              "w-fit font-semibold uppercase",
              team.attendanceOpen
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-700 dark:text-rose-400"
            )}
          >
            Attendance {team.attendanceOpen ? "open" : "closed"}
          </Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Attendance session
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fellows on this team can mark attendance only while this is open
              for the current week and day.
            </p>
          </div>
          <Button
            type="button"
            disabled={toggling || isPending || team.status !== "active"}
            className={cn(
              "gap-2 rounded-xl",
              team.attendanceOpen
                ? "bg-rose-600 text-white hover:bg-rose-600/90"
                : "bg-brand text-brand-foreground hover:bg-brand/90"
            )}
            onClick={handleAttendanceClick}
          >
            {team.attendanceOpen ? (
              <>
                <Lock className="size-4" aria-hidden />
                Close attendance
              </>
            ) : (
              <>
                <Unlock className="size-4" aria-hidden />
                Open attendance
              </>
            )}
          </Button>
        </div>
      </div>

      {roster ? (
        <div className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          <div className="border-b border-border/60 px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground">
              Current session roster
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {roster.sessionLabel} · {roster.markedCount}/{roster.totalCount}{" "}
              marked
              {roster.attendanceOpen ? " · live" : ""}
            </p>
          </div>
          {roster.fellows.length > 0 ? (
            <div className="max-w-full overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    <th className="px-6 py-3">Fellow</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Attendance</th>
                    <th className="px-6 py-3">Marked at</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {roster.fellows.map((fellow) => (
                    <tr key={fellow.fellowId}>
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">
                          {fellow.fellowName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {fellow.fellowEmail}
                        </p>
                      </td>
                      <td className="px-4 py-4 capitalize text-muted-foreground">
                        {fellow.status}
                      </td>
                      <td className="px-4 py-4">
                        {fellow.marked ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="size-4" aria-hidden />
                            Marked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                            <Circle className="size-4" aria-hidden />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {fellow.markedAtLabel || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No fellows assigned to this team yet.
            </div>
          )}
        </div>
      ) : null}

      <form
        onSubmit={saveTeam}
        className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-foreground">Team details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClassName} htmlFor="detail-name">
              Team name
            </label>
            <Input
              id="detail-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClassName}
              required
            />
          </div>
          <div>
            <label className={labelClassName} htmlFor="detail-cohort">
              Cohort
            </label>
            <Input
              id="detail-cohort"
              value={cohortLabel}
              onChange={(e) => setCohortLabel(e.target.value)}
              className={fieldClassName}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClassName} htmlFor="detail-week">
                Current week
              </label>
              <Input
                id="detail-week"
                type="number"
                min={1}
                max={52}
                value={currentWeek}
                onChange={(e) => setCurrentWeek(e.target.value)}
                className={fieldClassName}
                required
              />
            </div>
            <div>
              <label className={labelClassName} htmlFor="detail-day">
                Current day
              </label>
              <Input
                id="detail-day"
                type="number"
                min={1}
                max={7}
                value={currentDay}
                onChange={(e) => setCurrentDay(e.target.value)}
                className={fieldClassName}
                required
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClassName} htmlFor="detail-description">
              Description
            </label>
            <textarea
              id="detail-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={textareaClassName}
            />
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button
            type="submit"
            disabled={saving || isPending}
            className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <div className="flex items-center gap-2">
            <UsersRound className="size-4 text-muted-foreground" aria-hidden />
            <h2 className="text-lg font-semibold text-foreground">Fellows</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {fellows.length} fellow{fellows.length === 1 ? "" : "s"} on this
            team.
          </p>
        </div>
        {fellows.length > 0 ? (
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Track</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {fellows.map((fellow) => (
                  <tr key={fellow.id}>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {fellow.first_name} {fellow.last_name}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {fellow.email}
                    </td>
                    <td className="px-4 py-4 text-foreground/80">
                      {fellow.preferred_track || "—"}
                    </td>
                    <td className="px-6 py-4 capitalize text-muted-foreground">
                      {fellow.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No fellows assigned to this team yet.
          </div>
        )}
      </div>

      <PifOpenAttendanceDialog
        open={openDialog}
        teamName={team.name}
        initialWeek={Number(currentWeek) || team.currentWeek}
        initialDay={Number(currentDay) || team.currentDay}
        saving={toggling}
        onOpenChange={setOpenDialog}
        onConfirm={(week, day) => {
          void setAttendance(true, week, day)
        }}
      />
    </div>
  )
}
