import { HostingDashboard } from "@/components/admin/hosting-dashboard"
import { brand } from "@/config/brand"

export const metadata = {
  title: `Hosting | Orders | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminHostingPage() {
  return <HostingDashboard />
}
