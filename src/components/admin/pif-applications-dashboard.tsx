"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import {
  Award,
  CheckCircle2,
  Eye,
  Inbox,
  MessageSquareReply,
  MoreHorizontal,
  Trash2,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAdminNotifications } from "@/components/admin/admin-notifications-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Database } from "@/types/database"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

export type PifApplication =
  Database["public"]["Tables"]["pif_applications"]["Row"]

type PifApplicationsDashboardProps = {
  applications: PifApplication[]
}

type ApplicationStatus = "new" | "read" | "replied"

function isThisWeek(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const weekAgo = new Date(now)
  weekAgo.setDate(now.getDate() - 7)
  return date >= weekAgo
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function truncate(text: string, maxLength = 60) {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}…`
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "new":
      return "bg-brand/10 text-brand"
    case "read":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400"
    case "replied":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
    default:
      return "bg-muted text-muted-foreground"
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
          <p className="truncate text-xs text-muted-foreground sm:text-sm">{label}</p>
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

function ApplicationActionsMenu({
  application,
  isPending,
  onView,
  onMarkRead,
  onMarkReplied,
  onDelete,
}: {
  application: PifApplication
  isPending: boolean
  onView: () => void
  onMarkRead: () => void
  onMarkReplied: () => void
  onDelete: () => void
}) {
  const menuItemClassName =
    "flex w-full cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground outline-none select-none data-highlighted:bg-muted data-disabled:pointer-events-none data-disabled:opacity-50"

  return (
    <MenuPrimitive.Root modal={false}>
      <MenuPrimitive.Trigger
        disabled={isPending}
        aria-label="Open application actions"
        className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
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
            <MenuPrimitive.Item className={menuItemClassName} onClick={onView}>
              <Eye className="size-4" aria-hidden />
              View
            </MenuPrimitive.Item>
            {application.status !== "read" ? (
              <MenuPrimitive.Item
                className={menuItemClassName}
                onClick={onMarkRead}
              >
                <CheckCircle2 className="size-4" aria-hidden />
                Mark as read
              </MenuPrimitive.Item>
            ) : null}
            {application.status !== "replied" ? (
              <MenuPrimitive.Item
                className={menuItemClassName}
                onClick={onMarkReplied}
              >
                <MessageSquareReply className="size-4" aria-hidden />
                Mark as replied
              </MenuPrimitive.Item>
            ) : null}
            <MenuPrimitive.Item
              className={cn(
                menuItemClassName,
                "text-destructive data-highlighted:bg-destructive/10"
              )}
              onClick={onDelete}
            >
              <Trash2 className="size-4" aria-hidden />
              Delete
            </MenuPrimitive.Item>
          </MenuPrimitive.Popup>
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  )
}

export function PifApplicationsDashboard({
  applications,
}: PifApplicationsDashboardProps) {
  const router = useRouter()
  const { refresh: refreshNotifications } = useAdminNotifications()
  const [isPending, startTransition] = useTransition()
  const [viewApplication, setViewApplication] = useState<PifApplication | null>(
    null
  )
  const [deleteTarget, setDeleteTarget] = useState<PifApplication | null>(null)

  const stats = useMemo(() => {
    const total = applications.length
    const newCount = applications.filter((item) => item.status === "new").length
    const thisWeek = applications.filter((item) =>
      isThisWeek(item.created_at)
    ).length
    const responded = applications.filter(
      (item) => item.status === "read" || item.status === "replied"
    ).length

    return { total, newCount, thisWeek, responded }
  }, [applications])

  async function updateStatus(id: string, status: ApplicationStatus) {
    const response = await fetch(`/api/admin/pif-applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      notify.error(data?.error ?? "Unable to update application.")
      return
    }

    notify.success(
      status === "read"
        ? "Application marked as read."
        : "Application marked as replied."
    )

    void refreshNotifications()
    startTransition(() => {
      router.refresh()
    })
  }

  async function deleteApplication(id: string) {
    const response = await fetch(`/api/admin/pif-applications/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      notify.error(data?.error ?? "Unable to delete application.")
      return
    }

    setDeleteTarget(null)
    notify.success("Application deleted.")
    void refreshNotifications()
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="grid min-w-0 grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          label="Total applications"
          value={stats.total}
          icon={Inbox}
          accent="bg-brand/10 text-brand"
        />
        <StatCard
          label="New"
          value={stats.newCount}
          icon={Award}
          accent="bg-sky-500/10 text-sky-700 dark:text-sky-400"
        />
        <StatCard
          label="This week"
          value={stats.thisWeek}
          icon={Users}
          accent="bg-violet-500/10 text-violet-700 dark:text-violet-400"
        />
        <StatCard
          label="Reviewed"
          value={stats.responded}
          icon={CheckCircle2}
          accent="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
        />
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Applications</h2>
          <p className="text-sm text-muted-foreground">
            Latest Product Innovation Fellowship applications from the website.
          </p>
        </div>

        {applications.length > 0 ? (
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-4 py-3">Track</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Motivation</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {applications.map((application) => (
                  <tr
                    key={application.id}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {application.first_name} {application.last_name}
                    </td>
                    <td className="px-4 py-4">
                      <Badge className="bg-brand/10 font-medium text-brand">
                        {application.preferred_track}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {application.email}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {application.phone}
                    </td>
                    <td className="max-w-[220px] px-4 py-4 text-foreground/80">
                      <span title={application.motivation}>
                        {truncate(application.motivation)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">
                      {formatDate(application.created_at)}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        className={cn(
                          "font-semibold uppercase",
                          statusBadgeClass(application.status)
                        )}
                      >
                        {application.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <ApplicationActionsMenu
                          application={application}
                          isPending={isPending}
                          onView={() => setViewApplication(application)}
                          onMarkRead={() =>
                            void updateStatus(application.id, "read")
                          }
                          onMarkReplied={() =>
                            void updateStatus(application.id, "replied")
                          }
                          onDelete={() => setDeleteTarget(application)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No PIF applications yet.
          </div>
        )}
      </div>

      <Dialog
        open={viewApplication !== null}
        onOpenChange={(open) => {
          if (!open) setViewApplication(null)
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {viewApplication ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  {viewApplication.first_name} {viewApplication.last_name}
                </DialogTitle>
                <DialogDescription>
                  Applied {formatDate(viewApplication.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Email
                    </p>
                    <a
                      href={`mailto:${viewApplication.email}`}
                      className="mt-1 block text-sm text-brand hover:underline"
                    >
                      {viewApplication.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Phone
                    </p>
                    <a
                      href={`tel:${viewApplication.phone}`}
                      className="mt-1 block text-sm text-foreground hover:underline"
                    >
                      {viewApplication.phone}
                    </a>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Preferred track
                  </p>
                  <Badge className="mt-2 bg-brand/10 font-medium text-brand">
                    {viewApplication.preferred_track}
                  </Badge>
                </div>

                {viewApplication.portfolio_url ? (
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Portfolio / GitHub / Behance
                    </p>
                    <a
                      href={viewApplication.portfolio_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block break-all text-sm text-brand hover:underline"
                    >
                      {viewApplication.portfolio_url}
                    </a>
                  </div>
                ) : null}

                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Education / Experience
                  </p>
                  <p className="mt-2 rounded-xl bg-muted/40 p-4 text-sm leading-relaxed text-foreground/80">
                    {viewApplication.education_experience}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Why do you want to join?
                  </p>
                  <p className="mt-2 rounded-xl bg-muted/40 p-4 text-sm leading-relaxed text-foreground/80">
                    {viewApplication.motivation}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    What do you hope to achieve?
                  </p>
                  <p className="mt-2 rounded-xl bg-muted/40 p-4 text-sm leading-relaxed text-foreground/80">
                    {viewApplication.goals}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Program commitment
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {viewApplication.program_commitment_agreed ? "Agreed" : "Not agreed"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Status
                    </p>
                    <Badge
                      className={cn(
                        "mt-2 font-semibold uppercase",
                        statusBadgeClass(viewApplication.status)
                      )}
                    >
                      {viewApplication.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setViewApplication(null)}>
                  Close
                </Button>
                <Button
                  render={
                    <a
                      href={`mailto:${viewApplication.email}?subject=${encodeURIComponent("Re: Your Product Innovation Fellowship application")}`}
                    />
                  }
                >
                  Reply via email
                </Button>
              </DialogFooter>
            </>
          ) : null}
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
            <DialogTitle>Delete application?</DialogTitle>
            <DialogDescription>
              This permanently removes the application from{" "}
              {deleteTarget
                ? `${deleteTarget.first_name} ${deleteTarget.last_name}`
                : "this applicant"}
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isPending || !deleteTarget}
              onClick={() => {
                if (deleteTarget) {
                  void deleteApplication(deleteTarget.id)
                }
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
