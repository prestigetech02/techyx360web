import type { Metadata } from "next"

import { AdminAcceptInviteForm } from "@/components/admin/admin-accept-invite-form"
import { brand } from "@/config/brand"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: `Accept invite | ${brand.name}`,
  description: "Accept your Techyx360 staff invitation and set a password.",
  path: "/admin/accept-invite",
  noIndex: true,
})

export default function AdminAcceptInvitePage() {
  return <AdminAcceptInviteForm />
}
