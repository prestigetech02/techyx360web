import { HostingDashboard } from "@/components/admin/hosting-dashboard"
import { brand } from "@/config/brand"
import { getAllHostingAccounts } from "@/lib/crm/hosting-accounts"
import { isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Hosting | Orders | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminHostingPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-w-0 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Hosting</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Supabase is not configured yet. Add your env keys to manage hosting
            accounts.
          </p>
        </div>
      </div>
    )
  }

  try {
    const accounts = await getAllHostingAccounts()
    return <HostingDashboard initialAccounts={accounts} />
  } catch {
    return (
      <div className="min-w-0 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Hosting</h1>
          <p className="mt-2 text-sm text-red-600">
            Could not load hosting accounts. Run{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              supabase/crm-hosting-accounts.sql
            </code>{" "}
            in the Supabase SQL editor.
          </p>
        </div>
        <HostingDashboard initialAccounts={[]} />
      </div>
    )
  }
}
