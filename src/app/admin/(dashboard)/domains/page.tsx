import { DomainsDashboard } from "@/components/admin/domains-dashboard"
import { brand } from "@/config/brand"
import { getAllDomainAccounts } from "@/lib/crm/domain-accounts"
import { isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Domains | Orders | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminDomainsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-w-0 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Domains</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Supabase is not configured yet. Add your env keys to manage domain
            accounts.
          </p>
        </div>
      </div>
    )
  }

  try {
    const accounts = await getAllDomainAccounts()
    return <DomainsDashboard initialAccounts={accounts} />
  } catch {
    return (
      <div className="min-w-0 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Domains</h1>
          <p className="mt-2 text-sm text-red-600">
            Could not load domain accounts. Run{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              supabase/crm-domain-accounts.sql
            </code>{" "}
            in the Supabase SQL editor.
          </p>
        </div>
        <DomainsDashboard initialAccounts={[]} />
      </div>
    )
  }
}
