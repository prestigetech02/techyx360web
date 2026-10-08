"use client"

import { useEffect, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { formatTeamSessionLabel } from "@/lib/pif/team-types"

type Props = {
  open: boolean
  teamName: string
  initialWeek: number
  initialDay: number
  saving?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (week: number, day: number) => void
}

const fieldClassName =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
const labelClassName = "mb-1.5 block text-xs font-medium text-foreground"

export function PifOpenAttendanceDialog({
  open,
  teamName,
  initialWeek,
  initialDay,
  saving = false,
  onOpenChange,
  onConfirm,
}: Props) {
  const [week, setWeek] = useState(String(initialWeek))
  const [day, setDay] = useState(String(initialDay))

  useEffect(() => {
    if (!open) return
    setWeek(String(initialWeek))
    setDay(String(initialDay))
  }, [open, initialWeek, initialDay])

  const weekNumber = Number(week) || 1
  const dayNumber = Number(day) || 1
  const preview = formatTeamSessionLabel(weekNumber, dayNumber, teamName)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onConfirm(weekNumber, dayNumber)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Open attendance</DialogTitle>
          <DialogDescription>
            Confirm the week and day fellows will mark for{" "}
            <span className="font-medium text-foreground">{teamName}</span>.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClassName} htmlFor="open-week">
                Week
              </label>
              <Input
                id="open-week"
                type="number"
                min={1}
                max={52}
                value={week}
                onChange={(event) => setWeek(event.target.value)}
                className={fieldClassName}
                required
              />
            </div>
            <div>
              <label className={labelClassName} htmlFor="open-day">
                Day
              </label>
              <Input
                id="open-day"
                type="number"
                min={1}
                max={7}
                value={day}
                onChange={(event) => setDay(event.target.value)}
                className={fieldClassName}
                required
              />
            </div>
          </div>
          <p className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground">
            Opening: <span className="font-medium">{preview}</span>
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {saving ? "Opening…" : "Open attendance"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
