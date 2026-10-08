import type { Metadata } from "next"

import { AdminAcceptInviteForm } from "@/components/admin/admin-accept-invite-form"
import { brand } from "@/config/brand"
import { createPageMetadata } from "@/lib/seo"
import {
  PIF_ATTENDANCE_ACCEPT_INVITE_PATH,
  PIF_ATTENDANCE_FORGOT_PASSWORD_PATH,
  PIF_ATTENDANCE_HOME_PATH,
  PIF_ATTENDANCE_LOGIN_PATH,
} from "@/lib/pifattendance/auth-paths"

export const metadata: Metadata = createPageMetadata({
  title: `Accept invite | PIF Attendance | ${brand.name}`,
  description: "Accept your Techyx360 PIF invitation and set a password.",
  path: PIF_ATTENDANCE_ACCEPT_INVITE_PATH,
  noIndex: true,
})

export default function PifAcceptInvitePage() {
  return (
    <AdminAcceptInviteForm
      mode="invite"
      portalLabel="PIF Attendance"
      successPath={PIF_ATTENDANCE_HOME_PATH}
      loginPath={PIF_ATTENDANCE_LOGIN_PATH}
      forgotPasswordPath={PIF_ATTENDANCE_FORGOT_PASSWORD_PATH}
    />
  )
}
