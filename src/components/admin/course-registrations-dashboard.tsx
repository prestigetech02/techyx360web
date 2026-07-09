"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Eye,
  GraduationCap,
  MessageSquareReply,
  MoreHorizontal,
  Trash2,
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
import { registrationTypeLabel } from "@/lib/admin/notifications"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

export type CourseRegistration =
  Database["public"]["Tables"]["course_registrations"]["Row"]

type CourseRegistrationsDashboardProps = {
  registrations: CourseRegistration[]
}

type RegistrationStatus = "new" | "read" | "replied"

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

function RegistrationActionsMenu({
  registration,
  isPending,
  onView,
  onMarkRead,
  onMarkReplied,
  onDelete,
}: {
  registration: CourseRegistration
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
        aria-label="Open registration actions"
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
            {registration.status !== "read" ? (
              <MenuPrimitive.Item
                className={menuItemClassName}
                onClick={onMarkRead}
              >
                <CheckCircle2 className="size-4" aria-hidden />
                Mark as read
              </MenuPrimitive.Item>
            ) : null}
            {registration.status !== "replied" ? (
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

export function CourseRegistrationsDashboard({
  registrations,
}: CourseRegistrationsDashboardProps) {
  const router = useRouter()
  const { refresh: refreshNotifications } = useAdminNotifications()
  const [isPending, startTransition] = useTransition()
  const [viewRegistration, setViewRegistration] =
    useState<CourseRegistration | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CourseRegistration | null>(
    null
  )

  const stats = useMemo(() => {
    const total = registrations.length
    const newCount = registrations.filter((item) => item.status === "new").length
    const thisWeek = registrations.filter((item) =>
      isThisWeek(item.created_at)
    ).length
    const responded = registrations.filter(
      (item) => item.status === "read" || item.status === "replied"
    ).length

    return { total, newCount, thisWeek, responded }
  }, [registrations])

  async function updateStatus(id: string, status: RegistrationStatus) {
    const response = await fetch(`/api/admin/course-registrations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      notify.error(data?.error ?? "Unable to update registration.")
      return
    }

    notify.success(
      status === "read"
        ? "Registration marked as read."
        : "Registration marked as replied."
    )

    void refreshNotifications()
    startTransition(() => {
      router.refresh()
    })
  }

  async function deleteRegistration(id: string) {
    const response = await fetch(`/api/admin/course-registrations/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      notify.error(data?.error ?? "Unable to delete registration.")
      return
    }

    setDeleteTarget(null)
    notify.success("Registration deleted.")
    void refreshNotifications()
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="grid min-w-0 grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          label="Total registrations"
          value={stats.total}
          icon={ClipboardList}
          accent="bg-brand/10 text-brand"
        />
        <StatCard
          label="New"
          value={stats.newCount}
          icon={GraduationCap}
          accent="bg-sky-500/10 text-sky-700 dark:text-sky-400"
        />
        <StatCard
          label="This week"
          value={stats.thisWeek}
          icon={BookOpen}
          accent="bg-violet-500/10 text-violet-700 dark:text-violet-400"
        />
        <StatCard
          label="Responded"
          value={stats.responded}
          icon={CheckCircle2}
          accent="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
        />
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Registrations</h2>
          <p className="text-sm text-muted-foreground">
            Course, SIWES, and corporate training submissions from the website.
          </p>
        </div>

        {registrations.length > 0 ? (
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">School</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {registrations.map((registration) => (
                  <tr
                    key={registration.id}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {registration.first_name} {registration.last_name}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="outline" className="font-semibold uppercase">
                        {registrationTypeLabel(registration.registration_type)}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {registration.email}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {registration.phone}
                    </td>
                    <td className="max-w-[160px] px-4 py-4 text-foreground/80">
                      <span title={registration.school_name}>
                        {truncate(registration.school_name, 28)}
                      </span>
                    </td>
                    <td className="max-w-[180px] px-4 py-4 text-foreground/80">
                      <span title={registration.course_title}>
                        {truncate(registration.course_title, 32)}
                      </span>
                    </td>
                    <td className="max-w-[180px] px-4 py-4 text-foreground/80">
                      <span title={registration.message ?? undefined}>
                        {registration.message
                          ? truncate(registration.message)
                          : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">
                      {formatDate(registration.created_at)}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        className={cn(
                          "font-semibold uppercase",
                          statusBadgeClass(registration.status)
                        )}
                      >
                        {registration.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <RegistrationActionsMenu
                          registration={registration}
                          isPending={isPending}
                          onView={() => setViewRegistration(registration)}
                          onMarkRead={() =>
                            void updateStatus(registration.id, "read")
                          }
                          onMarkReplied={() =>
                            void updateStatus(registration.id, "replied")
                          }
                          onDelete={() => setDeleteTarget(registration)}
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
            No course registrations yet.
          </div>
        )}
      </div>

      <Dialog
        open={viewRegistration !== null}
        onOpenChange={(open) => {
          if (!open) setViewRegistration(null)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          {viewRegistration ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  {viewRegistration.first_name} {viewRegistration.last_name}
                </DialogTitle>
                <DialogDescription>
                  Registered {formatDate(viewRegistration.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3">
                  <p className="text-xs font-semibold tracking-wide text-brand uppercase">
                    Program
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {viewRegistration.course_title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {viewRegistration.school_name}
                  </p>
                  <Badge variant="outline" className="mt-2 font-semibold uppercase">
                    {registrationTypeLabel(viewRegistration.registration_type)}
                  </Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Email
                    </p>
                    <a
                      href={`mailto:${viewRegistration.email}`}
                      className="mt-1 block text-sm text-brand hover:underline"
                    >
                      {viewRegistration.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Phone
                    </p>
                    <a
                      href={`tel:${viewRegistration.phone}`}
                      className="mt-1 block text-sm text-foreground hover:underline"
                    >
                      {viewRegistration.phone}
                    </a>
                  </div>
                </div>

                {viewRegistration.message ? (
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Additional notes
                    </p>
                    <p className="mt-2 rounded-xl bg-muted/40 p-4 text-sm leading-relaxed text-foreground/80">
                      {viewRegistration.message}
                    </p>
                  </div>
                ) : null}

                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Status
                  </p>
                  <Badge
                    className={cn(
                      "mt-2 font-semibold uppercase",
                      statusBadgeClass(viewRegistration.status)
                    )}
                  >
                    {viewRegistration.status}
                  </Badge>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setViewRegistration(null)}
                >
                  Close
                </Button>
                <Button
                  render={
                    <a
                      href={`mailto:${viewRegistration.email}?subject=${encodeURIComponent(`Re: Your registration for ${viewRegistration.course_title}`)}`}
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
            <DialogTitle>Delete registration?</DialogTitle>
            <DialogDescription>
              This permanently removes the registration from{" "}
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
                  void deleteRegistration(deleteTarget.id)
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
