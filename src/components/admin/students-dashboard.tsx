"use client"

import { useState, useTransition, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import {
  BookOpen,
  CheckCircle2,
  Eye,
  GraduationCap,
  MoreHorizontal,
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
import {
  STUDENT_STATUS_FILTERS,
  STUDENT_STATUS_LABELS,
  type StudentListStats,
  type StudentStatus,
  type StudentStatusFilter,
  type StudentView,
} from "@/lib/academy/student-types"
import type { AdminPaginationMeta } from "@/lib/admin/pagination"
import { registrationTypeLabel } from "@/lib/admin/notifications"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

type StudentsDashboardProps = {
  students: StudentView[]
  stats: StudentListStats
  pagination: AdminPaginationMeta
  statusFilter: StudentStatusFilter
  pathname: string
  query?: Record<string, string | undefined>
}

const fieldClassName =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
const labelClassName = "mb-1.5 block text-xs font-medium text-foreground"
const textareaClassName = cn(
  fieldClassName,
  "min-h-[88px] resize-y py-2.5 leading-relaxed"
)

function truncate(text: string, maxLength = 60) {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}…`
}

function statusBadgeClass(status: StudentStatus) {
  switch (status) {
    case "enrolled":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-400"
    case "active":
      return "bg-brand/10 text-brand"
    case "completed":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
    case "dropped":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-400"
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

function StudentActionsMenu({
  isPending,
  onView,
  onDelete,
}: {
  isPending: boolean
  onView: () => void
  onDelete: () => void
}) {
  const menuItemClassName =
    "flex w-full cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground outline-none select-none data-highlighted:bg-muted data-disabled:pointer-events-none data-disabled:opacity-50"

  return (
    <MenuPrimitive.Root modal={false}>
      <MenuPrimitive.Trigger
        disabled={isPending}
        aria-label="Open student actions"
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
              View / edit
            </MenuPrimitive.Item>
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

export function StudentsDashboard({
  students,
  stats,
  pagination,
  statusFilter,
  pathname,
  query = {},
}: StudentsDashboardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [viewStudent, setViewStudent] = useState<StudentView | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<StudentView | null>(null)
  const [status, setStatus] = useState<StudentStatus>("enrolled")
  const [enrolledAt, setEnrolledAt] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  function openStudent(student: StudentView) {
    setViewStudent(student)
    setStatus(student.status)
    setEnrolledAt(student.enrolledAt)
    setNotes(student.notes)
  }

  async function saveStudent(event: FormEvent) {
    event.preventDefault()
    if (!viewStudent) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/students/${viewStudent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, enrolledAt, notes }),
      })
      const data = (await response.json().catch(() => null)) as {
        error?: string
        student?: StudentView
      } | null

      if (!response.ok) {
        notify.error(data?.error ?? "Unable to update student.")
        return
      }

      notify.success("Student updated.")
      if (data?.student) setViewStudent(data.student)
      startTransition(() => {
        router.refresh()
      })
    } catch {
      notify.error("Unable to update student.")
    } finally {
      setSaving(false)
    }
  }

  async function removeStudent(id: string) {
    const response = await fetch(`/api/admin/students/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      notify.error(data?.error ?? "Unable to delete student.")
      return
    }

    setDeleteTarget(null)
    if (viewStudent?.id === id) setViewStudent(null)
    notify.success("Student deleted.")
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
        <StatCard
          label="Total students"
          value={stats.total}
          icon={Users}
          accent="bg-brand/10 text-brand"
        />
        <StatCard
          label="Enrolled"
          value={stats.enrolled}
          icon={UserRound}
          accent="bg-sky-500/10 text-sky-700 dark:text-sky-400"
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={GraduationCap}
          accent="bg-violet-500/10 text-violet-700 dark:text-violet-400"
        />
        <StatCard
          label="This week"
          value={stats.thisWeek}
          icon={BookOpen}
          accent="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
        />
      </div>

      <AdminStatusFilterTabs
        active={statusFilter}
        pathname={pathname}
        query={query}
        filters={STUDENT_STATUS_FILTERS}
      />

      <div className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Students</h2>
          <p className="text-sm text-muted-foreground">
            Enrolled learners created when you convert a course registration.
          </p>
        </div>

        {students.length > 0 ? (
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Enrolled</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {student.fullName}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="outline" className="font-semibold uppercase">
                        {registrationTypeLabel(student.registrationType)}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {student.email}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {student.phone || "—"}
                    </td>
                    <td className="max-w-[200px] px-4 py-4 text-foreground/80">
                      <span title={student.courseTitle}>
                        {truncate(student.courseTitle || "—", 36)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">
                      {student.enrolledAtLabel}
                    </td>
                    <td className="px-4 py-4">
                      {student.financePaymentId ? (
                        <Badge className="bg-emerald-500/10 font-semibold text-emerald-700 dark:text-emerald-400">
                          Recorded
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        className={cn(
                          "font-semibold uppercase",
                          statusBadgeClass(student.status)
                        )}
                      >
                        {student.statusLabel}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <StudentActionsMenu
                          isPending={isPending}
                          onView={() => openStudent(student)}
                          onDelete={() => setDeleteTarget(student)}
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
            {statusFilter === "all"
              ? "No students yet. Convert a course registration to create one."
              : `No ${statusFilter} students.`}
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
        open={viewStudent !== null}
        onOpenChange={(open) => {
          if (!open) setViewStudent(null)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          {viewStudent ? (
            <>
              <DialogHeader>
                <DialogTitle>{viewStudent.fullName}</DialogTitle>
                <DialogDescription>
                  Enrolled {viewStudent.enrolledAtLabel}
                </DialogDescription>
              </DialogHeader>

              <form className="space-y-4" onSubmit={saveStudent}>
                <div className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3">
                  <p className="text-xs font-semibold tracking-wide text-brand uppercase">
                    Programme
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {viewStudent.courseTitle || "—"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {viewStudent.schoolName || "—"}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Email
                    </p>
                    <a
                      href={`mailto:${viewStudent.email}`}
                      className="mt-1 block text-sm text-brand hover:underline"
                    >
                      {viewStudent.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Phone
                    </p>
                    <a
                      href={`tel:${viewStudent.phone}`}
                      className="mt-1 block text-sm text-foreground hover:underline"
                    >
                      {viewStudent.phone || "—"}
                    </a>
                  </div>
                </div>

                {viewStudent.location ? (
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Location
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {viewStudent.location}
                    </p>
                  </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClassName} htmlFor="student-status">
                      Status
                    </label>
                    <select
                      id="student-status"
                      value={status}
                      onChange={(event) =>
                        setStatus(event.target.value as StudentStatus)
                      }
                      className={cn(fieldClassName, "appearance-none")}
                    >
                      {(
                        Object.entries(STUDENT_STATUS_LABELS) as Array<
                          [StudentStatus, string]
                        >
                      ).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className={labelClassName}
                      htmlFor="student-enrolled-at"
                    >
                      Enrolled on
                    </label>
                    <Input
                      id="student-enrolled-at"
                      type="date"
                      value={enrolledAt}
                      onChange={(event) => setEnrolledAt(event.target.value)}
                      className={fieldClassName}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClassName} htmlFor="student-notes">
                    Notes
                  </label>
                  <textarea
                    id="student-notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    className={textareaClassName}
                    placeholder="Cohort, progress, or internal notes"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {viewStudent.financePaymentId ? (
                    <Badge className="gap-1 bg-emerald-500/10 font-semibold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="size-3.5" aria-hidden />
                      Fee recorded in finance
                    </Badge>
                  ) : null}
                  {viewStudent.courseRegistrationId ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      render={
                        <Link href="/admin/registrations?status=converted" />
                      }
                    >
                      View registrations
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    render={<Link href="/admin/payments" />}
                  >
                    Payments
                  </Button>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setViewStudent(null)}
                  >
                    Close
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </Button>
                </DialogFooter>
              </form>
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
            <DialogTitle>Delete student?</DialogTitle>
            <DialogDescription>
              This removes{" "}
              {deleteTarget ? deleteTarget.fullName : "this student"} from the
              students list. The original registration is not deleted.
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
                if (deleteTarget) void removeStudent(deleteTarget.id)
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
