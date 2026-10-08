import { redirect } from "next/navigation"

import { PifAttendanceShell } from "@/components/pifattendance/pif-attendance-shell"
import { requirePifFellow } from "@/lib/pifattendance/require-fellow"

export default async function PifAttendanceDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { fellow, email } = await requirePifFellow()

  return (
    <PifAttendanceShell userEmail={email} fellowName={fellow.fullName}>
      {children}
    </PifAttendanceShell>
  )
}
