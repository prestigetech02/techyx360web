import { brand } from "@/config/brand"
import { OverviewDashboard } from "@/components/admin/overview-dashboard"
import { getAdminDashboardData } from "@/lib/admin/dashboard"

export const metadata = {
  title: `Dashboard | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData()

  return <OverviewDashboard data={data} />
}
