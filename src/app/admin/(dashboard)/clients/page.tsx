import { brand } from "@/config/brand"

export const metadata = {
  title: `Clients | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminClientsPage() {
  return (
    <div className="min-w-0 space-y-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
          CRM
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          Clients
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          View and manage corporate clients, project contacts, and account
          relationships.
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Client records will appear here once connected to Supabase.
        </p>
      </div>
    </div>
  )
}
