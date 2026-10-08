"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import {
  Mail,
  MoreHorizontal,
  Plus,
  Trash2,
  UserRound,
  Users,
} from "lucide-react"

import { AdminStatusFilterTabs } from "@/components/admin/admin-status-filter-tabs"
import { AdminTablePagination } from "@/components/admin/admin-table-pagination"
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
import type { AdminPaginationMeta } from "@/lib/admin/pagination"
import {
  PIF_FELLOW_STATUS_FILTERS,
  type PifFellowListStats,
  type PifFellowStatus,
  type PifFellowStatusFilter,
  type PifFellowView,
} from "@/lib/pif/fellow-types"
import type { PifTeamView } from "@/lib/pif/team-types"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

type PifFellowsDashboardProps = {
  fellows: PifFellowView[]
  teams: PifTeamView[]
  stats: PifFellowListStats
  pagination: AdminPaginationMeta
  statusFilter: PifFellowStatusFilter
  pathname: string
  query?: Record<string, string | undefined>
}

const fieldClassName =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
const labelClassName = "mb-1.5 block text-xs font-medium text-foreground"

function statusBadgeClass(status: PifFellowStatus) {
  switch (status) {
    case "invited":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400"
    case "active":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
    case "inactive":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-400"
  }
}

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
    <div className="rounded-2xl border border-border/60 bg-card p-3 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground sm:text-sm">
            {label}
          </p>
          <p className="mt-1 text-xl font-bold tracking-tight text-foreground sm:mt-2 sm:text-3xl">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg sm:size-10 sm:rounded-xl",
            accent
          )}
        >
          <Icon className="size-4 sm:size-5" aria-hidden />
        </div>
      </div>
    </div>
  )
}

export function PifFellowsDashboard({
  fellows,
  teams,
  stats,
  pagination,
  statusFilter,
  pathname,
  query = {},
}: PifFellowsDashboardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PifFellowView | null>(null)
  const [saving, setSaving] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [teamId, setTeamId] = useState("")
  const [cohortLabel, setCohortLabel] = useState("")
  const [preferredTrack, setPreferredTrack] = useState("")
  const activeTeams = teams.filter((team) => team.status === "active")

  function resetCreateForm() {
    setFirstName("")
    setLastName("")
    setEmail("")
    setPhone("")
    setTeamId("")
    setCohortLabel("")
    setPreferredTrack("")
  }

  async function createFellow(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      const response = await fetch("/api/admin/pif-fellows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          teamId: teamId || null,
          cohortLabel,
          preferredTrack,
        }),
      })
      const data = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      if (!response.ok) {
        notify.error(data?.error ?? "Unable to create fellow.")
        return
      }
      notify.success("Fellow created.")
      setCreateOpen(false)
      resetCreateForm()
      startTransition(() => router.refresh())
    } catch {
      notify.error("Unable to create fellow.")
    } finally {
      setSaving(false)
    }
  }

  async function inviteFellow(fellow: PifFellowView) {
    const response = await fetch(`/api/admin/pif-fellows/${fellow.id}/invite`, {
      method: "POST",
    })
    const data = (await response.json().catch(() => null)) as {
      error?: string
      message?: string
      alreadyRegistered?: boolean
    } | null

    if (!response.ok) {
      notify.error(data?.error ?? "Unable to send invite.")
      return
    }

    notify.success(data?.message ?? "Invite sent.")
    startTransition(() => router.refresh())
  }

  async function setFellowStatus(fellow: PifFellowView, status: PifFellowStatus) {
    const response = await fetch(`/api/admin/pif-fellows/${fellow.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      notify.error(data?.error ?? "Unable to update status.")
      return
    }
    notify.success("Status updated.")
    startTransition(() => router.refresh())
  }

  async function removeFellow(id: string) {
    const response = await fetch(`/api/admin/pif-fellows/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      notify.error(data?.error ?? "Unable to delete fellow.")
      return
    }
    setDeleteTarget(null)
    notify.success("Fellow deleted.")
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
            Fellows
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage PIF fellows and invite them to{" "}
            <span className="font-medium text-foreground">/pifattendance</span>.
          </p>
        </div>
        <Button
          className="gap-2 rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-4" aria-hidden />
          Add fellow
        </Button>
      </div>

      <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
        <StatCard
          label="Total"
          value={stats.total}
          icon={Users}
          accent="bg-brand/10 text-brand"
        />
        <StatCard
          label="Invited"
          value={stats.invited}
          icon={Mail}
          accent="bg-amber-500/10 text-amber-700 dark:text-amber-400"
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={UserRound}
          accent="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
        />
        <StatCard
          label="Inactive"
          value={stats.inactive}
          icon={UserRound}
          accent="bg-rose-500/10 text-rose-700 dark:text-rose-400"
        />
      </div>

      <AdminStatusFilterTabs
        active={statusFilter}
        pathname={pathname}
        query={query}
        filters={PIF_FELLOW_STATUS_FILTERS}
      />

      <div className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Fellows</h2>
          <p className="text-sm text-muted-foreground">
            Add fellows, send portal invites, and manage access.
          </p>
        </div>

        {fellows.length > 0 ? (
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Cohort</th>
                  <th className="px-4 py-3">Track</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {fellows.map((fellow) => (
                  <tr
                    key={fellow.id}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {fellow.fullName}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {fellow.email}
                    </td>
                    <td className="px-4 py-4 text-foreground/80">
                      {fellow.teamName || "—"}
                    </td>
                    <td className="px-4 py-4 text-foreground/80">
                      {fellow.cohortLabel || "—"}
                    </td>
                    <td className="px-4 py-4 text-foreground/80">
                      {fellow.preferredTrack || "—"}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        className={cn(
                          "font-semibold uppercase",
                          statusBadgeClass(fellow.status)
                        )}
                      >
                        {fellow.statusLabel}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <MenuPrimitive.Root modal={false}>
                          <MenuPrimitive.Trigger
                            disabled={isPending}
                            aria-label="Fellow actions"
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
                              <MenuPrimitive.Popup className="min-w-48 overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none">
                                <MenuPrimitive.Item
                                  className="flex w-full cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none data-highlighted:bg-muted"
                                  onClick={() => void inviteFellow(fellow)}
                                >
                                  <Mail className="size-4" aria-hidden />
                                  Send portal invite
                                </MenuPrimitive.Item>
                                {fellow.status !== "active" ? (
                                  <MenuPrimitive.Item
                                    className="flex w-full cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none data-highlighted:bg-muted"
                                    onClick={() =>
                                      void setFellowStatus(fellow, "active")
                                    }
                                  >
                                    Mark active
                                  </MenuPrimitive.Item>
                                ) : null}
                                {fellow.status !== "inactive" ? (
                                  <MenuPrimitive.Item
                                    className="flex w-full cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none data-highlighted:bg-muted"
                                    onClick={() =>
                                      void setFellowStatus(fellow, "inactive")
                                    }
                                  >
                                    Mark inactive
                                  </MenuPrimitive.Item>
                                ) : null}
                                <MenuPrimitive.Item
                                  className="flex w-full cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive outline-none data-highlighted:bg-destructive/10"
                                  onClick={() => setDeleteTarget(fellow)}
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
            {statusFilter === "all"
              ? "No fellows yet. Add someone to invite them to the attendance portal."
              : `No ${statusFilter} fellows.`}
          </div>
        )}

        <AdminTablePagination
          pagination={pagination}
          pathname={pathname}
          query={{
            ...query,
            ...(statusFilter !== "all" ? { status: statusFilter } : {}),
          }}
        />
      </div>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open)
          if (!open) resetCreateForm()
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add fellow</DialogTitle>
            <DialogDescription>
              Creates a PIF fellow record. Send a portal invite afterward so
              they can sign in at /pifattendance/login.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={createFellow}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClassName} htmlFor="fellow-first">
                  First name
                </label>
                <Input
                  id="fellow-first"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={fieldClassName}
                  required
                />
              </div>
              <div>
                <label className={labelClassName} htmlFor="fellow-last">
                  Last name
                </label>
                <Input
                  id="fellow-last"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={fieldClassName}
                  required
                />
              </div>
            </div>
            <div>
              <label className={labelClassName} htmlFor="fellow-email">
                Email
              </label>
              <Input
                id="fellow-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClassName}
                required
              />
            </div>
            <div>
              <label className={labelClassName} htmlFor="fellow-phone">
                Phone
              </label>
              <Input
                id="fellow-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={fieldClassName}
              />
            </div>
            <div>
              <label className={labelClassName} htmlFor="fellow-team">
                Team
              </label>
              <select
                id="fellow-team"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className={cn(fieldClassName, "appearance-none")}
              >
                <option value="">No team</option>
                {activeTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                    {team.cohortLabel ? ` (${team.cohortLabel})` : ""}
                  </option>
                ))}
              </select>
              {activeTeams.length === 0 ? (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  No active teams yet. Create one under Programs → PIF → Teams.
                </p>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClassName} htmlFor="fellow-cohort">
                  Cohort
                </label>
                <Input
                  id="fellow-cohort"
                  value={cohortLabel}
                  onChange={(e) => setCohortLabel(e.target.value)}
                  className={fieldClassName}
                  placeholder="e.g. 2026 Cohort A"
                />
              </div>
              <div>
                <label className={labelClassName} htmlFor="fellow-track">
                  Track
                </label>
                <Input
                  id="fellow-track"
                  value={preferredTrack}
                  onChange={(e) => setPreferredTrack(e.target.value)}
                  className={fieldClassName}
                  placeholder="e.g. Product Management"
                />
              </div>
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
                {saving ? "Saving…" : "Create fellow"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete fellow?</DialogTitle>
            <DialogDescription>
              This removes{" "}
              {deleteTarget ? deleteTarget.fullName : "this fellow"} from PIF
              fellows. Their auth login is not deleted automatically.
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
                if (deleteTarget) void removeFellow(deleteTarget.id)
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
