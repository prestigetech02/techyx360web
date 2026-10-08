import type { Metadata } from "next"

import { AdminAcceptInviteForm } from "@/components/admin/admin-accept-invite-form"
import { brand } from "@/config/brand"
import { createPageMetadata } from "@/lib/seo"
import {
  PIF_ATTENDANCE_FORGOT_PASSWORD_PATH,
  PIF_ATTENDANCE_HOME_PATH,
  PIF_ATTENDANCE_LOGIN_PATH,
  PIF_ATTENDANCE_RESET_PASSWORD_PATH,
} from "@/lib/pifattendance/auth-paths"

export const metadata: Metadata = createPageMetadata({
  title: `Reset password | PIF Attendance | ${brand.name}`,
  description: "Choose a new password for your Techyx360 PIF attendance login.",
  path: PIF_ATTENDANCE_RESET_PASSWORD_PATH,
  noIndex: true,
})

export default function PifResetPasswordPage() {
  return (
    <AdminAcceptInviteForm
      mode="reset"
      portalLabel="PIF Attendance"
      successPath={PIF_ATTENDANCE_HOME_PATH}
      loginPath={PIF_ATTENDANCE_LOGIN_PATH}
      forgotPasswordPath={PIF_ATTENDANCE_FORGOT_PASSWORD_PATH}
    />
  )
}
