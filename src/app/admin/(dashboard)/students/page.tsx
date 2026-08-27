import { StudentsDashboard } from "@/components/admin/students-dashboard"
import { brand } from "@/config/brand"
import { getStudentsPageData } from "@/lib/academy/students"
import { isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Students | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

type AdminStudentsPageProps = {
  searchParams?: Promise<{
    page?: string
    status?: string
  }>
}

export default async function AdminStudentsPage({
  searchParams,
}: AdminStudentsPageProps) {
  const params = (await searchParams) ?? {}

  return (
    <div className="min-w-0 space-y-5">
      <div>
        <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
          Academy
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          Students
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Enrolled learners from course registrations. Convert a registration to
          add someone here.
        </p>
      </div>

      {!isSupabaseConfigured() ? (
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Supabase is not configured yet. Add your env keys to manage
            students.
          </p>
        </div>
      ) : (
        <StudentsPageContent page={params.page} status={params.status} />
      )}
    </div>
  )
}

async function StudentsPageContent({
  page,
  status,
}: {
  page?: string
  status?: string
}) {
  try {
    const data = await getStudentsPageData({ page, status })

    return (
      <StudentsDashboard
        students={data.students}
        stats={data.stats}
        pagination={data.pagination}
        statusFilter={data.statusFilter}
        pathname="/admin/students"
        query={{
          ...(status ? { status } : {}),
          ...(page ? { page } : {}),
        }}
      />
    )
  } catch {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
        Could not load students. Make sure you ran{" "}
        <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs dark:bg-red-950/50">
          supabase/academy-students.sql
        </code>{" "}
        in Supabase.
      </div>
    )
  }
}
