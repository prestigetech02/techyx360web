"use client"

import { useEffect, useState, type FormEvent } from "react"
import { CheckCircle2 } from "lucide-react"

import { BrandCtaButton } from "@/components/ui/brand-cta-button"
import { formatAttendanceDateTime } from "@/lib/pif/attendance-types"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

type AttendanceReason =
  | "ok"
  | "closed"
  | "no_team"
  | "team_unavailable"

type Props = {
  fellowName: string
  sessionLabel?: string
  alreadyMarked: boolean
  markedAt: string | null
  isOpen: boolean
  reason?: AttendanceReason
}

function useLiveClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  return now
}

function closedMessage(reason?: AttendanceReason) {
  if (reason === "no_team") {
    return "You are not assigned to a team yet. Contact your facilitator."
  }
  if (reason === "team_unavailable") {
    return "Your team is not available for attendance right now. Contact your facilitator."
  }
  return "Attendance is closed at the moment, Please come back later"
}

export function PifMarkAttendanceForm({
  fellowName,
  sessionLabel,
  alreadyMarked,
  markedAt,
  isOpen,
  reason = "closed",
}: Props) {
  const now = useLiveClock()
  const [checked, setChecked] = useState(false)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(alreadyMarked)
  const [doneAt, setDoneAt] = useState(markedAt)

  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const timeLabel = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!checked) {
      notify.error("Tick the attendance box before submitting.")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/pifattendance/mark", {
        method: "POST",
      })
      const data = (await response.json().catch(() => null)) as {
        error?: string
        record?: { markedAt?: string }
      } | null

      if (!response.ok) {
        notify.error(data?.error ?? "Unable to mark attendance.")
        return
      }

      setDone(true)
      setDoneAt(data?.record?.markedAt ?? new Date().toISOString())
      notify.success("Attendance marked. Thank you.")
    } catch {
      notify.error("Unable to mark attendance.")
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold leading-snug text-balance text-foreground sm:text-lg">
          {closedMessage(reason)}
        </h2>
      </div>
    )
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm sm:p-6 dark:border-emerald-900/40 dark:bg-emerald-950/30">
        <div className="flex items-start gap-3">
          <CheckCircle2
            className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400"
            aria-hidden
          />
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground sm:text-lg">
              Attendance marked
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Hi {fellowName}, you are marked present
              {sessionLabel ? ` for ${sessionLabel}` : ""}
              {doneAt ? ` · ${formatAttendanceDateTime(doneAt)}` : ""}.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-6"
    >
      {sessionLabel ? (
        <p className="text-[0.65rem] font-semibold tracking-[0.16em] text-brand uppercase sm:text-xs sm:tracking-[0.2em]">
          {sessionLabel}
        </p>
      ) : null}

      <div className="mt-4 space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Current date
          </p>
          <p className="mt-1 text-base font-semibold text-foreground sm:text-lg">
            {dateLabel}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Current time
          </p>
          <p className="mt-1 text-base font-semibold tabular-nums text-foreground sm:text-lg">
            {timeLabel}
          </p>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 bg-background px-3 py-3 sm:px-4">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => setChecked(event.target.checked)}
            className="mt-1 size-4 shrink-0 rounded border-border text-brand focus:ring-brand/30"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-foreground">
              Mark attendance
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
              I confirm I am present for this PIF session
              {sessionLabel ? ` (${sessionLabel})` : ""}.
            </span>
          </span>
        </label>
      </div>

      <BrandCtaButton
        type="submit"
        className={cn("mt-6 w-full", saving && "pointer-events-none opacity-70")}
      >
        {saving ? "Submitting..." : "Submit"}
      </BrandCtaButton>
    </form>
  )
}
