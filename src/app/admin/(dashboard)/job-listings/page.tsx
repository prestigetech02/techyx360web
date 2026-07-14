import Link from "next/link"
import { Plus } from "lucide-react"

import { JobListingsDashboard } from "@/components/admin/job-listings-dashboard"
import { Button } from "@/components/ui/button"
import { brand } from "@/config/brand"
import { getAllJobOpeningRows } from "@/lib/careers/openings"
import { isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Job Listings | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminJobListingsPage() {
  const supabaseReady = isSupabaseConfigured()
  const listings = supabaseReady ? await getAllJobOpeningRows() : []

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            Careers
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
            Job listings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage open roles on the public Careers page.
          </p>
        </div>

        {supabaseReady ? (
          <Button
            className="h-11 shrink-0 rounded-xl bg-brand px-5 text-brand-foreground hover:bg-brand/90"
            render={<Link href="/admin/job-listings/new" />}
          >
            <Plus className="size-4" aria-hidden />
            Add listing
          </Button>
        ) : null}
      </div>

      {!supabaseReady ? (
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
          <p className="text-sm text-muted-foreground sm:text-base">
            Supabase is not configured yet. Add your env keys and run
            `supabase/job-openings.sql` before managing listings.
          </p>
        </div>
      ) : (
        <JobListingsDashboard listings={listings} />
      )}
    </div>
  )
}
