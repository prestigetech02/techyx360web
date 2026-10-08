import type { Metadata } from "next"

import { PifMarkAttendanceForm } from "@/components/pifattendance/pif-mark-attendance-form"
import { brand } from "@/config/brand"
import { getFellowTeamAttendanceState } from "@/lib/pif/attendance"
import { createPageMetadata } from "@/lib/seo"
import { requirePifFellow } from "@/lib/pifattendance/require-fellow"

export const metadata: Metadata = createPageMetadata({
  title: `Home | PIF Attendance | ${brand.name}`,
  description: "Product Innovation Fellowship attendance home.",
  path: "/pifattendance/home",
  noIndex: true,
})

export default async function PifAttendanceHomePage() {
  const { fellow } = await requirePifFellow()
  const state = await getFellowTeamAttendanceState(fellow.id).catch(() => ({
    isOpen: false,
    sessionLabel: "",
    teamId: null,
    week: null,
    day: null,
    alreadyMarked: false,
    markedAt: null,
    reason: "closed" as const,
  }))

  return (
    <div className="mx-auto w-full max-w-md space-y-4 sm:space-y-5">
      <div className="text-center sm:text-left">
        <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase sm:text-xs sm:tracking-[0.28em]">
          Product Innovation Fellowship
        </p>
        <h1 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
          Mark attendance
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome, {fellow.fullName}
          {fellow.teamName ? ` · ${fellow.teamName}` : ""}.
        </p>
      </div>

      <PifMarkAttendanceForm
        fellowName={fellow.fullName}
        sessionLabel={state.sessionLabel}
        isOpen={state.isOpen}
        alreadyMarked={state.alreadyMarked}
        markedAt={state.markedAt}
        reason={state.reason}
      />
    </div>
  )
}
