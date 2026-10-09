import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { brand } from "@/config/brand"
import { createPageMetadata } from "@/lib/seo"
import { PIF_ATTENDANCE_LOGIN_PATH } from "@/lib/pifattendance/auth-paths"
import { getOptionalPifFellowSession } from "@/lib/pifattendance/require-fellow"
import { isSupabaseConfigured } from "@/lib/supabase/env"

export const metadata: Metadata = createPageMetadata({
  title: `PIF Attendance | ${brand.name}`,
  description: "Product Innovation Fellowship attendance portal.",
  path: "/pifattendance",
  noIndex: true,
})

export default async function PifAttendanceIndexPage() {
  if (!isSupabaseConfigured()) {
    redirect(PIF_ATTENDANCE_LOGIN_PATH)
  }

  const session = await getOptionalPifFellowSession()
  if (!session) {
    redirect(PIF_ATTENDANCE_LOGIN_PATH)
  }

  redirect("/pifattendance/home")
}
