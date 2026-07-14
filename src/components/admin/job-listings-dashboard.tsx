"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import {
  Briefcase,
  Eye,
  EyeOff,
  FileText,
  Globe,
  MoreHorizontal,
  Pencil,
  Trash2,
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
import { formatCareerSalaryRange } from "@/config/careers"
import type { JobOpeningRow } from "@/lib/careers/openings"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

type JobListingsDashboardProps = {
  listings: JobOpeningRow[]
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    dateStyle: "medium",
  })
}

function statusLabel(status: string) {
  switch (status) {
    case "open":
      return "Open"
    case "draft":
      return "Draft"
    case "closed":
      return "Closed"
    default:
      return status
  }
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "open":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
    case "draft":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400"
    case "closed":
      return "bg-muted text-muted-foreground"
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

function ListingActionsMenu({
  listing,
  isPending,
  onView,
  onEdit,
  onPublish,
  onUnpublish,
  onDelete,
}: {
  listing: JobOpeningRow
  isPending: boolean
  onView: () => void
  onEdit: () => void
  onPublish: () => void
  onUnpublish: () => void
  onDelete: () => void
}) {
  const menuItemClassName =
    "flex w-full cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground outline-none select-none data-highlighted:bg-muted data-disabled:pointer-events-none data-disabled:opacity-50"

  return (
    <MenuPrimitive.Root modal={false}>
      <MenuPrimitive.Trigger
        disabled={isPending}
        aria-label="Open listing actions"
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
            <MenuPrimitive.Item className={menuItemClassName} onClick={onEdit}>
              <Pencil className="size-4" aria-hidden />
              Edit
            </MenuPrimitive.Item>
            {listing.status !== "open" ? (
              <MenuPrimitive.Item
                className={menuItemClassName}
                onClick={onPublish}
              >
                <Globe className="size-4" aria-hidden />
                Publish
              </MenuPrimitive.Item>
            ) : null}
            {listing.status === "open" ? (
              <MenuPrimitive.Item
                className={menuItemClassName}
                onClick={onUnpublish}
              >
                <EyeOff className="size-4" aria-hidden />
                Unpublish
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

function DetailSection({
  title,
  items,
}: {
  title: string
  items: string[]
}) {
  if (items.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

export function JobListingsDashboard({ listings }: JobListingsDashboardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [viewListing, setViewListing] = useState<JobOpeningRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<JobOpeningRow | null>(null)

  const stats = useMemo(() => {
    return {
      total: listings.length,
      open: listings.filter((item) => item.status === "open").length,
      draft: listings.filter((item) => item.status === "draft").length,
      closed: listings.filter((item) => item.status === "closed").length,
    }
  }, [listings])

  async function updateStatus(id: string, status: string) {
    const response = await fetch(`/api/admin/job-openings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      notify.error(data?.error ?? "Unable to update listing.")
      return
    }

    notify.success(
      status === "open"
        ? "Listing published."
        : status === "closed"
          ? "Listing unpublished."
          : "Listing status updated."
    )

    if (viewListing?.id === id) {
      setViewListing(null)
    }

    startTransition(() => {
      router.refresh()
    })
  }

  async function deleteListing(id: string) {
    const response = await fetch(`/api/admin/job-openings/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      notify.error(data?.error ?? "Unable to delete listing.")
      return
    }

    setDeleteTarget(null)
    notify.success("Listing deleted.")
    startTransition(() => {
      router.refresh()
    })
  }

  const viewSalary = viewListing
    ? formatCareerSalaryRange(viewListing.salary_min, viewListing.salary_max)
    : null

  return (
    <div className="min-w-0 space-y-6">
      <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
        <StatCard
          label="Total listings"
          value={stats.total}
          icon={Briefcase}
          accent="bg-brand/10 text-brand"
        />
        <StatCard
          label="Open"
          value={stats.open}
          icon={FileText}
          accent="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
        />
        <StatCard
          label="Draft"
          value={stats.draft}
          icon={FileText}
          accent="bg-amber-500/10 text-amber-700 dark:text-amber-400"
        />
        <StatCard
          label="Closed"
          value={stats.closed}
          icon={FileText}
          accent="bg-muted text-muted-foreground"
        />
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">All listings</h2>
          <p className="text-sm text-muted-foreground">
            Manage roles shown on the public Careers page.
          </p>
        </div>

        {listings.length > 0 ? (
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <th className="px-6 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Posted</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr
                    key={listing.id}
                    className="border-b border-border/40 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">
                        {listing.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        /careers/{listing.slug}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {listing.department}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {listing.location}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {listing.employment_type}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        className={cn(
                          "rounded-full border-0 px-2.5 py-0.5 text-xs font-medium",
                          statusBadgeClass(listing.status)
                        )}
                      >
                        {statusLabel(listing.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {formatDate(listing.created_at)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <ListingActionsMenu
                        listing={listing}
                        isPending={isPending}
                        onView={() => setViewListing(listing)}
                        onEdit={() =>
                          router.push(`/admin/job-listings/${listing.id}/edit`)
                        }
                        onPublish={() => updateStatus(listing.id, "open")}
                        onUnpublish={() => updateStatus(listing.id, "closed")}
                        onDelete={() => setDeleteTarget(listing)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <Briefcase
              className="mx-auto size-10 text-muted-foreground/50"
              aria-hidden
            />
            <p className="mt-4 text-sm font-medium text-foreground">
              No job listings yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first role to publish it on the Careers page.
            </p>
          </div>
        )}
      </div>

      <Dialog
        open={viewListing != null}
        onOpenChange={(open) => {
          if (!open) setViewListing(null)
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          {viewListing ? (
            <>
              <DialogHeader>
                <DialogTitle>{viewListing.title}</DialogTitle>
                <DialogDescription>
                  {viewListing.department} · {viewListing.location} ·{" "}
                  {viewListing.employment_type}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    className={cn(
                      "rounded-full border-0 px-2.5 py-0.5 text-xs font-medium",
                      statusBadgeClass(viewListing.status)
                    )}
                  >
                    {statusLabel(viewListing.status)}
                  </Badge>
                  {viewSalary ? (
                    <span className="text-muted-foreground">{viewSalary}</span>
                  ) : null}
                  <span className="text-muted-foreground">
                    Posted {formatDate(viewListing.created_at)}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Short description
                  </h3>
                  <p className="mt-1 text-muted-foreground">
                    {viewListing.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    About the role
                  </h3>
                  <div
                    className="prose prose-sm mt-2 max-w-none text-muted-foreground dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: viewListing.overview }}
                  />
                </div>

                <DetailSection
                  title="Responsibilities"
                  items={viewListing.responsibilities ?? []}
                />
                <DetailSection
                  title="Requirements"
                  items={viewListing.requirements ?? []}
                />
                <DetailSection
                  title="Nice to have"
                  items={viewListing.nice_to_have ?? []}
                />
                <DetailSection
                  title="Benefits"
                  items={viewListing.benefits ?? []}
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                {viewListing.status === "open" ? (
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    render={
                      <a
                        href={`/careers/${viewListing.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    View on site
                  </Button>
                ) : (
                  <Button
                    className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
                    disabled={isPending}
                    onClick={() => updateStatus(viewListing.id, "open")}
                  >
                    Publish
                  </Button>
                )}
                <Button
                  variant={viewListing.status === "open" ? "default" : "outline"}
                  className={cn(
                    "rounded-xl",
                    viewListing.status === "open" &&
                      "bg-brand text-brand-foreground hover:bg-brand/90"
                  )}
                  onClick={() => {
                    setViewListing(null)
                    router.push(`/admin/job-listings/${viewListing.id}/edit`)
                  }}
                >
                  Edit listing
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete listing?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `“${deleteTarget.title}” will be removed permanently. This cannot be undone.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setDeleteTarget(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={isPending || !deleteTarget}
              onClick={() => {
                if (deleteTarget) {
                  void deleteListing(deleteTarget.id)
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
