import { TeamDashboard } from "@/components/admin/team-dashboard"
import { brand } from "@/config/brand"

export const metadata = {
  title: `Team | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminTeamPage() {
  return <TeamDashboard />
}
