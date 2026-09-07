import type { Metadata } from "next"

import { AdminForgotPasswordForm } from "@/components/admin/admin-forgot-password-form"
import { brand } from "@/config/brand"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: `Forgot password | ${brand.name}`,
  description: "Request a password reset link for your Techyx360 staff login.",
  path: "/admin/forgot-password",
  noIndex: true,
})

export default function AdminForgotPasswordPage() {
  return <AdminForgotPasswordForm />
}
