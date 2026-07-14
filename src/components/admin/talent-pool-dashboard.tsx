"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  Download,
  Eye,
  Inbox,
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
import type { Database } from "@/types/database"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

export type TalentPoolSubmission =
  Database["public"]["Tables"]["talent_pool_submissions"]["Row"]

type TalentPoolDashboardProps = {
  submissions: TalentPoolSubmission[]
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

export function TalentPoolDashboard({ submissions }: TalentPoolDashboardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selected, setSelected] = useState<TalentPoolSubmission | null>(null)
  const [filter, setFilter] = useState<"all" | SubmissionStatus>("all")

  const stats = useMemo(() => {
    return {
      total: submissions.length,
      newCount: submissions.filter((item) => item.status === "new").length,
      thisWeek: submissions.filter((item) => isThisWeek(item.created_at)).length,
      replied: submissions.filter((item) => item.status === "replied").length,
    }
  }, [submissions])

  const filtered = useMemo(() => {
    if (filter === "all") return submissions
    return submissions.filter((item) => item.status === filter)
  }, [submissions, filter])

  async function updateStatus(id: string, status: SubmissionStatus) {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/talent-pool/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        })
        const result = (await response.json().catch(() => null)) as {
          error?: string
        } | null

        if (!response.ok) {
          throw new Error(result?.error ?? "Unable to update status.")
        }

        notify.success(`Marked as ${status}.`)
        router.refresh()
        setSelected((current) =>
          current?.id === id ? { ...current, status } : current
        )
      } catch (error) {
        notify.error(
          error instanceof Error ? error.message : "Unable to update status."
        )
      }
    })
  }

  async function deleteSubmission(id: string) {
    if (!window.confirm("Delete this talent pool submission permanently?")) {
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/talent-pool/${id}`, {
          method: "DELETE",
        })
        const result = (await response.json().catch(() => null)) as {
          error?: string
        } | null

        if (!response.ok) {
          throw new Error(result?.error ?? "Unable to delete submission.")
        }

        notify.success("Submission deleted.")
        setSelected(null)
        router.refresh()
      } catch (error) {
        notify.error(
          error instanceof Error ? error.message : "Unable to delete submission."
        )
      }
    })
  }

  async function downloadCv(id: string) {
    try {
      const response = await fetch(`/api/admin/talent-pool/${id}/cv`)
      const result = (await response.json().catch(() => null)) as {
        url?: string
        error?: string
      } | null

      if (!response.ok || !result?.url) {
        throw new Error(result?.error ?? "Unable to download CV.")
      }

      window.open(result.url, "_blank", "noopener,noreferrer")
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "Unable to download CV."
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total"
          value={stats.total}
          icon={Inbox}
          accent="bg-brand/10 text-brand"
        />
        <StatCard
          label="New"
          value={stats.newCount}
          icon={Users}
          accent="bg-sky-500/10 text-sky-600"
        />
        <StatCard
          label="This week"
          value={stats.thisWeek}
          icon={Eye}
          accent="bg-amber-500/10 text-amber-600"
        />
        <StatCard
          label="Replied"
          value={stats.replied}
          icon={CheckCircle2}
          accent="bg-emerald-500/10 text-emerald-600"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "new", "read", "replied"] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors",
              filter === status
                ? "bg-brand text-brand-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Candidate</th>
                <th className="px-4 py-3 font-medium">Interests</th>
                <th className="px-4 py-3 font-medium">Experience</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No talent pool submissions found.
                  </td>
                </tr>
              ) : (
                filtered.map((submission) => (
                  <tr
                    key={submission.id}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">
                        {submission.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {submission.email}
                      </p>
                    </td>
                    <td className="max-w-[16rem] px-4 py-3 text-muted-foreground">
                      <span className="line-clamp-2">
                        {submission.interest_areas}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {submission.years_of_experience}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={cn(
                          "rounded-full capitalize",
                          statusBadgeClass(submission.status)
                        )}
                      >
                        {submission.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(submission.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            setSelected(submission)
                            if (submission.status === "new") {
                              void updateStatus(submission.id, "read")
                            }
                          }}
                        >
                          <Eye className="size-3.5" aria-hidden />
                          View
                        </Button>
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          onClick={() => void downloadCv(submission.id)}
                        >
                          <Download className="size-3.5" aria-hidden />
                          CV
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      >
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-xl">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>{selected.full_name}</DialogTitle>
                <DialogDescription>
                  Talent pool candidate · {selected.interest_areas}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-sm">
                <p>
                  <span className="font-medium text-foreground">Email:</span>{" "}
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-brand hover:underline"
                  >
                    {selected.email}
                  </a>
                </p>
                <p>
                  <span className="font-medium text-foreground">Phone:</span>{" "}
                  {selected.phone}
                </p>
                <p>
                  <span className="font-medium text-foreground">Location:</span>{" "}
                  {selected.location}
                </p>
                <p>
                  <span className="font-medium text-foreground">
                    Experience:
                  </span>{" "}
                  {selected.years_of_experience}
                </p>
                <p>
                  <span className="font-medium text-foreground">
                    Availability:
                  </span>{" "}
                  {selected.availability}
                </p>
                {selected.expected_salary ? (
                  <p>
                    <span className="font-medium text-foreground">
                      Expected salary:
                    </span>{" "}
                    {selected.expected_salary}
                  </p>
                ) : null}
                {selected.portfolio_url ? (
                  <p>
                    <span className="font-medium text-foreground">
                      Portfolio:
                    </span>{" "}
                    <a
                      href={selected.portfolio_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand hover:underline"
                    >
                      {selected.portfolio_url}
                    </a>
                  </p>
                ) : null}
                {selected.linkedin_url ? (
                  <p>
                    <span className="font-medium text-foreground">
                      LinkedIn:
                    </span>{" "}
                    <a
                      href={selected.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand hover:underline"
                    >
                      {selected.linkedin_url}
                    </a>
                  </p>
                ) : null}
                {selected.github_url ? (
                  <p>
                    <span className="font-medium text-foreground">GitHub:</span>{" "}
                    <a
                      href={selected.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand hover:underline"
                    >
                      {selected.github_url}
                    </a>
                  </p>
                ) : null}
                {selected.message ? (
                  <div>
                    <p className="font-medium text-foreground">About</p>
                    <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                      {selected.message}
                    </p>
                  </div>
                ) : null}
              </div>

              <DialogFooter className="gap-2 sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => void downloadCv(selected.id)}
                  >
                    <Download className="size-3.5" aria-hidden />
                    Download CV
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => void updateStatus(selected.id, "replied")}
                  >
                    Mark replied
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isPending}
                  onClick={() => void deleteSubmission(selected.id)}
                >
                  <Trash2 className="size-3.5" aria-hidden />
                  Delete
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
