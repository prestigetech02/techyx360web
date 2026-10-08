"use client"

import { useState, useTransition, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { MoreHorizontal, Plus, Trash2, UsersRound } from "lucide-react"

import { PifOpenAttendanceDialog } from "@/components/admin/pif-open-attendance-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { formatTeamSessionLabel, type PifTeamView } from "@/lib/pif/team-types"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

type PifTeamsDashboardProps = {
  teams: PifTeamView[]
}

const fieldClassName =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
const labelClassName = "mb-1.5 block text-xs font-medium text-foreground"
const textareaClassName = cn(
  fieldClassName,
  "min-h-[80px] resize-y py-2.5 leading-relaxed"
)

export function PifTeamsDashboard({ teams }: PifTeamsDashboardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PifTeamView | null>(null)
  const [openTarget, setOpenTarget] = useState<PifTeamView | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [cohortLabel, setCohortLabel] = useState("")
  const [description, setDescription] = useState("")
  const [currentWeek, setCurrentWeek] = useState("1")
  const [currentDay, setCurrentDay] = useState("1")

  function resetForm() {
    setName("")
    setCohortLabel("")
    setDescription("")
    setCurrentWeek("1")
    setCurrentDay("1")
  }

  async function createTeam(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      const response = await fetch("/api/admin/pif-teams", {
        method: "POST",
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
        notify.error(data?.error ?? "Unable to create team.")
        return
      }
      notify.success("Team created.")
      setCreateOpen(false)
      resetForm()
      startTransition(() => router.refresh())
    } catch {
      notify.error("Unable to create team.")
    } finally {
      setSaving(false)
    }
  }

  async function setTeamStatus(
    team: PifTeamView,
    status: "active" | "archived"
  ) {
    const response = await fetch(`/api/admin/pif-teams/${team.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      notify.error(data?.error ?? "Unable to update team.")
      return
    }
    notify.success("Team updated.")
    startTransition(() => router.refresh())
  }

  function handleAttendanceClick(team: PifTeamView) {
    if (team.attendanceOpen) {
      void setAttendance(team, false, team.currentWeek, team.currentDay)
      return
    }
    setOpenTarget(team)
  }

  async function setAttendance(
    team: PifTeamView,
    attendanceOpen: boolean,
    week: number,
    day: number
  ) {
    setTogglingId(team.id)
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
          : `Attendance closed for ${team.name}`
      )
      setOpenTarget(null)
      startTransition(() => router.refresh())
    } catch {
      notify.error("Unable to update attendance.")
    } finally {
      setTogglingId(null)
    }
  }

  async function removeTeam(id: string) {
    const response = await fetch(`/api/admin/pif-teams/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      notify.error(data?.error ?? "Unable to delete team.")
      return
    }
    setDeleteTarget(null)
    notify.success("Team deleted.")
    startTransition(() => router.refresh())
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            Product Innovation Fellowship
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Teams
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Open attendance per team for the configured week and day.
          </p>
        </div>
        <Button
          className="gap-2 rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-4" aria-hidden />
          Add team
        </Button>
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Teams</h2>
          <p className="text-sm text-muted-foreground">
            {teams.length} team{teams.length === 1 ? "" : "s"}
          </p>
        </div>

        {teams.length > 0 ? (
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-4 py-3">Cohort</th>
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3">Fellows</th>
                  <th className="px-4 py-3">Attendance</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {teams.map((team) => (
                  <tr
                    key={team.id}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/programs/pif/teams/${team.id}`}
                        className="font-medium text-foreground hover:text-brand hover:underline"
                      >
                        {team.name}
                      </Link>
                      {team.description ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {team.description}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-foreground/80">
                      {team.cohortLabel || "—"}
                    </td>
                    <td className="px-4 py-4 text-foreground/80">
                      Week {team.currentWeek}, Day {team.currentDay}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <UsersRound className="size-3.5" aria-hidden />
                        {team.fellowCount}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        disabled={
                          isPending ||
                          togglingId === team.id ||
                          team.status !== "active"
                        }
                        onClick={() => handleAttendanceClick(team)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50",
                          team.attendanceOpen
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "border-border bg-muted/40 text-muted-foreground"
                        )}
                        aria-pressed={team.attendanceOpen}
                        title={
                          team.attendanceOpen
                            ? `Close attendance for ${team.sessionLabel}`
                            : `Open attendance for ${team.sessionLabel}`
                        }
                      >
                        <span
                          className={cn(
                            "size-2 rounded-full",
                            team.attendanceOpen
                              ? "bg-emerald-500"
                              : "bg-muted-foreground/40"
                          )}
                        />
                        {togglingId === team.id
                          ? "…"
                          : team.attendanceOpen
                            ? "Open"
                            : "Closed"}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        className={cn(
                          "font-semibold uppercase",
                          team.status === "active"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {team.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <MenuPrimitive.Root modal={false}>
                          <MenuPrimitive.Trigger
                            disabled={isPending}
                            aria-label="Team actions"
                            className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                          >
                            <MoreHorizontal className="size-4" aria-hidden />
                          </MenuPrimitive.Trigger>
                          <MenuPrimitive.Portal>
                            <MenuPrimitive.Positioner
                              side="bottom"
                              align="end"
                              sideOffset={4}
                              className="z-50 outline-none"
                            >
                              <MenuPrimitive.Popup className="min-w-44 overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none">
                                <MenuPrimitive.Item
                                  className="flex w-full cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none data-highlighted:bg-muted"
                                  onClick={() =>
                                    router.push(
                                      `/admin/programs/pif/teams/${team.id}`
                                    )
                                  }
                                >
                                  View details
                                </MenuPrimitive.Item>
                                {team.status !== "active" ? (
                                  <MenuPrimitive.Item
                                    className="flex w-full cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none data-highlighted:bg-muted"
                                    onClick={() =>
                                      void setTeamStatus(team, "active")
                                    }
                                  >
                                    Mark active
                                  </MenuPrimitive.Item>
                                ) : (
                                  <MenuPrimitive.Item
                                    className="flex w-full cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none data-highlighted:bg-muted"
                                    onClick={() =>
                                      void setTeamStatus(team, "archived")
                                    }
                                  >
                                    Archive
                                  </MenuPrimitive.Item>
                                )}
                                <MenuPrimitive.Item
                                  className="flex w-full cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive outline-none data-highlighted:bg-destructive/10"
                                  onClick={() => setDeleteTarget(team)}
                                >
                                  <Trash2 className="size-4" aria-hidden />
                                  Delete
                                </MenuPrimitive.Item>
                              </MenuPrimitive.Popup>
                            </MenuPrimitive.Positioner>
                          </MenuPrimitive.Portal>
                        </MenuPrimitive.Root>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No teams yet. Create one before assigning fellows.
          </div>
        )}
      </div>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add team</DialogTitle>
            <DialogDescription>
              Set the starting week and day for attendance sessions.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={createTeam}>
            <div>
              <label className={labelClassName} htmlFor="team-name">
                Team name
              </label>
              <Input
                id="team-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClassName}
                placeholder="e.g. Team Spark"
                required
              />
            </div>
            <div>
              <label className={labelClassName} htmlFor="team-cohort">
                Cohort
              </label>
              <Input
                id="team-cohort"
                value={cohortLabel}
                onChange={(e) => setCohortLabel(e.target.value)}
                className={fieldClassName}
                placeholder="e.g. 2026 Cohort A"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClassName} htmlFor="team-week">
                  Current week
                </label>
                <Input
                  id="team-week"
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
                <label className={labelClassName} htmlFor="team-day">
                  Current day
                </label>
                <Input
                  id="team-day"
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
            <div>
              <label className={labelClassName} htmlFor="team-description">
                Description
              </label>
              <textarea
                id="team-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={textareaClassName}
                placeholder="Optional notes"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
              >
                {saving ? "Saving…" : "Create team"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <PifOpenAttendanceDialog
        open={openTarget !== null}
        teamName={openTarget?.name ?? ""}
        initialWeek={openTarget?.currentWeek ?? 1}
        initialDay={openTarget?.currentDay ?? 1}
        saving={Boolean(openTarget && togglingId === openTarget.id)}
        onOpenChange={(open) => {
          if (!open) setOpenTarget(null)
        }}
        onConfirm={(week, day) => {
          if (!openTarget) return
          void setAttendance(openTarget, true, week, day)
        }}
      />

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete team?</DialogTitle>
            <DialogDescription>
              This removes{" "}
              {deleteTarget ? deleteTarget.name : "this team"}. Fellows on the
              team will be unassigned.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!deleteTarget}
              onClick={() => {
                if (deleteTarget) void removeTeam(deleteTarget.id)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
