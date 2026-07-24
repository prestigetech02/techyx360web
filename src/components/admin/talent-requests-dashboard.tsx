"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import {
  BriefcaseBusiness,
  CheckCircle2,
  Eye,
  Inbox,
  Mail,
  MessageSquareReply,
  MoreHorizontal,
  Trash2,
  Users,
} from "lucide-react"

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
import type { TalentRequestRow } from "@/lib/talent-requests"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

type TalentRequestsDashboardProps = {
  requests: TalentRequestRow[]
}

type RequestStatus = "new" | "read" | "replied"

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

function RequestActionsMenu({
  request,
  isPending,
  onView,
  onMarkRead,
  onMarkReplied,
  onDelete,
}: {
  request: TalentRequestRow
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
        aria-label="Open request actions"
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
            {request.status !== "read" ? (
              <MenuPrimitive.Item
                className={menuItemClassName}
                onClick={onMarkRead}
              >
                <CheckCircle2 className="size-4" aria-hidden />
                Mark as read
              </MenuPrimitive.Item>
            ) : null}
            {request.status !== "replied" ? (
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

export function TalentRequestsDashboard({
  requests,
}: TalentRequestsDashboardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [viewRequest, setViewRequest] = useState<TalentRequestRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TalentRequestRow | null>(
    null
  )

  const stats = useMemo(() => {
    const total = requests.length
    const newCount = requests.filter((item) => item.status === "new").length
    const thisWeek = requests.filter((item) =>
      isThisWeek(item.created_at)
    ).length
    const headcount = requests.reduce((sum, item) => sum + item.headcount, 0)

    return { total, newCount, thisWeek, headcount }
  }, [requests])

  async function updateStatus(id: string, status: RequestStatus) {
    const response = await fetch(`/api/admin/talent-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      notify.error(data?.error ?? "Unable to update request.")
      return
    }

    notify.success(
      status === "read" ? "Request marked as read." : "Request marked as replied."
    )

    startTransition(() => {
      router.refresh()
    })
  }

  async function deleteRequest(id: string) {
    const response = await fetch(`/api/admin/talent-requests/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      notify.error(data?.error ?? "Unable to delete request.")
      return
    }

    setDeleteTarget(null)
    notify.success("Request deleted.")
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
        <StatCard
          label="Total requests"
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
          icon={BriefcaseBusiness}
          accent="bg-violet-500/10 text-violet-700 dark:text-violet-400"
        />
        <StatCard
          label="People requested"
          value={stats.headcount}
          icon={Users}
          accent="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
        />
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Requests</h2>
          <p className="text-sm text-muted-foreground">
            Talent outsourcing enquiries from the website.
          </p>
        </div>

        {requests.length > 0 ? (
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Engagement</th>
                  <th className="px-4 py-3">Headcount</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">
                        {request.first_name} {request.last_name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {request.email}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {request.company}
                    </td>
                    <td className="px-4 py-4 text-foreground/80">
                      {request.role_needed}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {request.engagement_type}
                    </td>
                    <td className="px-4 py-4 tabular-nums text-foreground">
                      {request.headcount}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">
                      {formatDate(request.created_at)}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        className={cn(
                          "font-semibold uppercase",
                          statusBadgeClass(request.status)
                        )}
                      >
                        {request.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <RequestActionsMenu
                          request={request}
                          isPending={isPending}
                          onView={() => setViewRequest(request)}
                          onMarkRead={() =>
                            void updateStatus(request.id, "read")
                          }
                          onMarkReplied={() =>
                            void updateStatus(request.id, "replied")
                          }
                          onDelete={() => setDeleteTarget(request)}
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
            No talent requests yet.
          </div>
        )}
      </div>

      <Dialog
        open={viewRequest !== null}
        onOpenChange={(open) => {
          if (!open) setViewRequest(null)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          {viewRequest ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  {viewRequest.first_name} {viewRequest.last_name}
                </DialogTitle>
                <DialogDescription>
                  Submitted {formatDate(viewRequest.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Email
                    </p>
                    <a
                      href={`mailto:${viewRequest.email}`}
                      className="mt-1 block text-sm text-brand hover:underline"
                    >
                      {viewRequest.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Phone
                    </p>
                    <a
                      href={`tel:${viewRequest.phone}`}
                      className="mt-1 block text-sm text-foreground hover:underline"
                    >
                      {viewRequest.phone}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Company
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {viewRequest.company}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Role needed
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {viewRequest.role_needed}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Engagement
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {viewRequest.engagement_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Headcount / Duration
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {viewRequest.headcount} · {viewRequest.duration}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Requirements
                  </p>
                  <p className="mt-2 rounded-xl bg-muted/40 p-4 text-sm leading-relaxed text-foreground/80">
                    {viewRequest.details}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Status
                  </p>
                  <Badge
                    className={cn(
                      "mt-2 font-semibold uppercase",
                      statusBadgeClass(viewRequest.status)
                    )}
                  >
                    {viewRequest.status}
                  </Badge>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setViewRequest(null)}>
                  Close
                </Button>
                <Button
                  render={
                    <a
                      href={`mailto:${viewRequest.email}?subject=${encodeURIComponent(`Re: Talent request — ${viewRequest.role_needed}`)}`}
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
            <DialogTitle>Delete request?</DialogTitle>
            <DialogDescription>
              This permanently removes the talent request from{" "}
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
                  void deleteRequest(deleteTarget.id)
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
