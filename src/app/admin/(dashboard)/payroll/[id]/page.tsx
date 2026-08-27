import { notFound } from "next/navigation"

import { PayrollRunDetail } from "@/components/admin/payroll-run-detail"
import { brand } from "@/config/brand"
import { getPayrollRunById } from "@/lib/payroll/runs"
import { isSupabaseConfigured } from "@/lib/supabase"

type AdminPayrollRunPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: AdminPayrollRunPageProps) {
  const { id } = await params
  const run = isSupabaseConfigured()
    ? await getPayrollRunById(id).catch(() => null)
    : null

  return {
    title: `${run?.label ?? "Payroll run"} | Finance | Admin | ${brand.name}`,
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function AdminPayrollRunPage({
  params,
}: AdminPayrollRunPageProps) {
  const { id } = await params

  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-6 text-sm text-muted-foreground">
        Supabase is not configured yet.
      </div>
    )
  }

  let run = null
  try {
    run = await getPayrollRunById(id)
  } catch {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
        Could not load this payroll run. Make sure{" "}
        <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs dark:bg-red-950/50">
          supabase/payroll.sql
        </code>{" "}
        has been applied.
      </div>
    )
  }

  if (!run) notFound()

  return <PayrollRunDetail run={run} />
}
