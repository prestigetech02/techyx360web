import Link from "next/link"
import { Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { brand } from "@/config/brand"
import { getAllJobOpenings } from "@/lib/careers/openings"

export const metadata = {
  title: `Job Listings | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export const revalidate = 30

export default async function AdminJobListingsPage() {
  const openings = await getAllJobOpenings()

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            Careers
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Job Listings
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            View and manage open roles published on the Careers page.
          </p>
        </div>

        <Button
          render={<Link href="/admin/job-listings/new" />}
          className="h-11 shrink-0 gap-2 rounded-xl bg-brand px-5 text-brand-foreground hover:bg-brand/90"
        >
          <Plus className="size-4" aria-hidden />
          Add listing
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            Current listings
          </h2>
          <p className="text-sm text-muted-foreground">
            Loaded from Supabase `job_openings` (falls back to static seed when
            the table is empty or unavailable).
          </p>
        </div>

        {openings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <th className="px-6 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {openings.map((position) => (
                  <tr
                    key={position.id}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {position.title}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {position.department}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {position.location}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {position.type}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        className={
                          position.status === "Open"
                            ? "bg-emerald-500/10 font-semibold text-emerald-700 uppercase dark:text-emerald-400"
                            : "bg-muted font-semibold text-muted-foreground uppercase"
                        }
                      >
                        {position.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/careers/${position.id}`}
                        className="font-medium text-brand hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-10 text-sm text-muted-foreground">
            No job openings found. Run `supabase/job-openings.sql` to create and
            seed the table, or add your first listing.
          </div>
        )}
      </div>
    </div>
  )
}
