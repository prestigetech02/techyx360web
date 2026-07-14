import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { JobListingForm } from "@/components/admin/job-listing-form"
import { Button } from "@/components/ui/button"
import { brand } from "@/config/brand"
import { getJobOpeningRowById } from "@/lib/careers/openings"
import { isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Edit Listing | Job Listings | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminJobListingEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-w-0 space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            render={<Link href="/admin/job-listings" />}
            aria-label="Back to job listings"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
              Careers
            </p>
            <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
              Edit listing
            </h1>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
          <p className="text-sm text-muted-foreground sm:text-base">
            Supabase is not configured yet. Add your env keys and run
            `supabase/job-openings.sql` before editing listings.
          </p>
        </div>
      </div>
    )
  }

  const listing = await getJobOpeningRowById(id)

  if (!listing) {
    notFound()
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          render={<Link href="/admin/job-listings" />}
          aria-label="Back to job listings"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            Careers
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
            Edit listing
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update {listing.title} for the public Careers page.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
        <JobListingForm listing={listing} />
      </div>
    </div>
  )
}
