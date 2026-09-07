import type { Metadata } from "next"

import { AdminAcceptInviteForm } from "@/components/admin/admin-accept-invite-form"
import { brand } from "@/config/brand"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: `Reset password | ${brand.name}`,
  description: "Choose a new password for your Techyx360 staff login.",
  path: "/admin/reset-password",
  noIndex: true,
})

export default function AdminResetPasswordPage() {
  return <AdminAcceptInviteForm mode="reset" />
}
