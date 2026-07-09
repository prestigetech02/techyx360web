import type { Metadata } from "next"

import { AdminLoginForm } from "@/components/admin/admin-login-form"
import { brand } from "@/config/brand"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: `Admin Sign In | ${brand.name}`,
  description: "Sign in to the Techyx360 admin dashboard.",
  path: "/admin/login",
  noIndex: true,
})

export default function AdminLoginPage() {
  return <AdminLoginForm />
}
