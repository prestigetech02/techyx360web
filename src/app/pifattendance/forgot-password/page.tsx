import type { Metadata } from "next"

import { PifForgotPasswordForm } from "@/components/pifattendance/pif-forgot-password-form"
import { brand } from "@/config/brand"
import { createPageMetadata } from "@/lib/seo"
import { PIF_ATTENDANCE_FORGOT_PASSWORD_PATH } from "@/lib/pifattendance/auth-paths"

export const metadata: Metadata = createPageMetadata({
  title: `Forgot password | PIF Attendance | ${brand.name}`,
  description: "Reset your Techyx360 PIF attendance password.",
  path: PIF_ATTENDANCE_FORGOT_PASSWORD_PATH,
  noIndex: true,
})

export default function PifForgotPasswordPage() {
  return <PifForgotPasswordForm />
}
