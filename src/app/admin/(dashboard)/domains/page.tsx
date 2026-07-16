import { DomainsDashboard } from "@/components/admin/domains-dashboard"
import { brand } from "@/config/brand"

export const metadata = {
  title: `Domains | Orders | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminDomainsPage() {
  return <DomainsDashboard />
}
