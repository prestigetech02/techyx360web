"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import {
  CheckCircle2,
  Eye,
  Inbox,
  Mail,
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
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

export type ContactSubmission =
  Database["public"]["Tables"]["contact_submissions"]["Row"]

type ContactSubmissionsDashboardProps = {
  submissions: ContactSubmission[]
}

type SubmissionStatus = "new" | "read" | "replied"

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

function SubmissionActionsMenu({
  submission,
  isPending,
  onView,
  onMarkRead,
  onMarkReplied,
  onDelete,
}: {
  submission: ContactSubmission
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
        aria-label="Open submission actions"
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
            {submission.status !== "read" ? (
              <MenuPrimitive.Item
                className={menuItemClassName}
                onClick={onMarkRead}
              >
                <CheckCircle2 className="size-4" aria-hidden />
                Mark as read
              </MenuPrimitive.Item>
            ) : null}
            {submission.status !== "replied" ? (
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

export function ContactSubmissionsDashboard({
  submissions,
}: ContactSubmissionsDashboardProps) {
  const router = useRouter()
  const { refresh: refreshNotifications } = useAdminNotifications()
  const [isPending, startTransition] = useTransition()
  const [viewSubmission, setViewSubmission] = useState<ContactSubmission | null>(
    null
  )
  const [deleteTarget, setDeleteTarget] = useState<ContactSubmission | null>(
    null
  )

  const stats = useMemo(() => {
    const total = submissions.length
    const newCount = submissions.filter((s) => s.status === "new").length
    const thisWeek = submissions.filter((s) => isThisWeek(s.created_at)).length
    const responded = submissions.filter(
      (s) => s.status === "read" || s.status === "replied"
    ).length

    return { total, newCount, thisWeek, responded }
  }, [submissions])

  async function updateStatus(id: string, status: SubmissionStatus) {
    const response = await fetch(`/api/admin/contact-submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      notify.error(data?.error ?? "Unable to update submission.")
      return
    }

    notify.success(
      status === "read"
        ? "Submission marked as read."
        : "Submission marked as replied."
    )

    void refreshNotifications()
    startTransition(() => {
      router.refresh()
    })
  }

  async function deleteSubmission(id: string) {
    const response = await fetch(`/api/admin/contact-submissions/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      notify.error(data?.error ?? "Unable to delete submission.")
      return
    }

    setDeleteTarget(null)
    notify.success("Submission deleted.")
    void refreshNotifications()
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="grid min-w-0 grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          label="Total submissions"
          value={stats.total}
          icon={Inbox}
          accent="bg-brand/10 text-brand"
        />
        <StatCard
          label="New"
          value={stats.newCount}
          icon={Mail}
          accent="bg-sky-500/10 text-sky-700 dark:text-sky-400"
        />
        <StatCard
          label="This week"
          value={stats.thisWeek}
          icon={MessageSquareReply}
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
          <h2 className="text-lg font-semibold text-foreground">Submissions</h2>
          <p className="text-sm text-muted-foreground">
            Latest website enquiries from the contact page.
          </p>
        </div>

        {submissions.length > 0 ? (
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {submissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {submission.first_name} {submission.last_name}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {submission.email}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {submission.phone}
                    </td>
                    <td className="max-w-[220px] px-4 py-4 text-foreground/80">
                      <span title={submission.message}>
                        {truncate(submission.message)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">
                      {formatDate(submission.created_at)}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        className={cn(
                          "font-semibold uppercase",
                          statusBadgeClass(submission.status)
                        )}
                      >
                        {submission.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <SubmissionActionsMenu
                          submission={submission}
                          isPending={isPending}
                          onView={() => setViewSubmission(submission)}
                          onMarkRead={() =>
                            void updateStatus(submission.id, "read")
                          }
                          onMarkReplied={() =>
                            void updateStatus(submission.id, "replied")
                          }
                          onDelete={() => setDeleteTarget(submission)}
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
            No contact submissions yet.
          </div>
        )}
      </div>

      <Dialog
        open={viewSubmission !== null}
        onOpenChange={(open) => {
          if (!open) setViewSubmission(null)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          {viewSubmission ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  {viewSubmission.first_name} {viewSubmission.last_name}
                </DialogTitle>
                <DialogDescription>
                  Submitted {formatDate(viewSubmission.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Email
                    </p>
                    <a
                      href={`mailto:${viewSubmission.email}`}
                      className="mt-1 block text-sm text-brand hover:underline"
                    >
                      {viewSubmission.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Phone
                    </p>
                    <a
                      href={`tel:${viewSubmission.phone}`}
                      className="mt-1 block text-sm text-foreground hover:underline"
                    >
                      {viewSubmission.phone}
                    </a>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Message
                  </p>
                  <p className="mt-2 rounded-xl bg-muted/40 p-4 text-sm leading-relaxed text-foreground/80">
                    {viewSubmission.message}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Status
                  </p>
                  <Badge
                    className={cn(
                      "mt-2 font-semibold uppercase",
                      statusBadgeClass(viewSubmission.status)
                    )}
                  >
                    {viewSubmission.status}
                  </Badge>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setViewSubmission(null)}>
                  Close
                </Button>
                <Button
                  render={
                    <a
                      href={`mailto:${viewSubmission.email}?subject=${encodeURIComponent("Re: Your enquiry to Techyx360")}`}
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
            <DialogTitle>Delete submission?</DialogTitle>
            <DialogDescription>
              This permanently removes the enquiry from{" "}
              {deleteTarget
                ? `${deleteTarget.first_name} ${deleteTarget.last_name}`
                : "this contact"}
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
                  void deleteSubmission(deleteTarget.id)
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
