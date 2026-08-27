import { PayrollDashboard } from "@/components/admin/payroll-dashboard"
import { brand } from "@/config/brand"
import { getAllPayrollRuns, getPayrollListStats } from "@/lib/payroll/runs"
import { isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Payroll | Finance | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminPayrollPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-w-0 space-y-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            Finance
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Payroll
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Supabase is not configured yet. Add your env keys to manage payroll.
          </p>
        </div>
      </div>
    )
  }

  try {
    const runs = await getAllPayrollRuns()
    const stats = await getPayrollListStats(runs)

    return <PayrollDashboard runs={runs} stats={stats} />
  } catch {
    return (
      <div className="min-w-0 space-y-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            Finance
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Payroll
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create month-end pay runs and payslips.
          </p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          Could not load payroll. Make sure you have run{" "}
          <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs dark:bg-red-950/50">
            supabase/payroll.sql
          </code>{" "}
          in Supabase.
        </div>
      </div>
    )
  }
}
