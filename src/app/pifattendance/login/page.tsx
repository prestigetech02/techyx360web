import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { PifLoginForm } from "@/components/pifattendance/pif-login-form"
import { brand } from "@/config/brand"
import { createPageMetadata } from "@/lib/seo"
import {
  PIF_ATTENDANCE_HOME_PATH,
  PIF_ATTENDANCE_LOGIN_PATH,
} from "@/lib/pifattendance/auth-paths"
import { getOptionalPifFellowSession } from "@/lib/pifattendance/require-fellow"

export const metadata: Metadata = createPageMetadata({
  title: `PIF Attendance Sign In | ${brand.name}`,
  description:
    "Sign in to the Techyx360 Product Innovation Fellowship attendance portal.",
  path: PIF_ATTENDANCE_LOGIN_PATH,
  noIndex: true,
})

export default async function PifAttendanceLoginPage() {
  const session = await getOptionalPifFellowSession()
  if (session) {
    redirect(PIF_ATTENDANCE_HOME_PATH)
  }

  return <PifLoginForm />
}
