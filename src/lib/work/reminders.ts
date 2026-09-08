import "server-only"

import { siteUrl } from "@/config/site"
import {
  isTransactionalEmailConfigured,
  sendTransactionalEmail,
} from "@/lib/email/zeptomail"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  formatTaskSchedule,
  parseTimeOfDay,
  taskTouchesDate,
} from "@/lib/work/dates"
import { getAllStaffTasks } from "@/lib/work/tasks"
import {
  STAFF_TASK_PRIORITY_LABELS,
  STAFF_TASK_STATUS_LABELS,
  type StaffTaskView,
} from "@/lib/work/task-types"

const OPEN_STATUSES = new Set(["todo", "in_progress", "blocked"])
const DEFAULT_START = "09:00"
const UPCOMING_HOURS = 5
const DIGEST_HOUR = 8

export type ReminderKind = "upcoming" | "pending" | "overdue"

type ReminderRow = {
  member_id: string
  task_id: string | null
  kind: ReminderKind
  sent_for_date: string
}

export function isTaskReminderEmailConfigured() {
  return isTransactionalEmailConfigured()
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function lagosNow() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Lagos",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .map((part) => [part.type, part.value])
  )

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  }
}

function taskStartAt(task: StaffTaskView) {
  const startDate = task.startsOn || task.scheduledOn
  if (!startDate) return null
  const time = parseTimeOfDay(task.startTime) ?? DEFAULT_START
  return new Date(`${startDate}T${time}:00+01:00`)
}

function taskEndDate(task: StaffTaskView) {
  return task.endsOn || task.startsOn || task.scheduledOn
}

function isOpenTask(task: StaffTaskView) {
  return OPEN_STATUSES.has(task.status) && Boolean(task.assigneeId)
}

function isOverdueNow(task: StaffTaskView, today: string) {
  const end = taskEndDate(task)
  if (!isOpenTask(task) || !end) return false
  return end < today
}

function isUpcomingNow(task: StaffTaskView, now: Date) {
  if (!isOpenTask(task) || !task.startTime || !(task.startsOn || task.scheduledOn)) {
    return false
  }
  const startAt = taskStartAt(task)
  if (!startAt) return false
  const remindAt = new Date(startAt.getTime() - UPCOMING_HOURS * 60 * 60 * 1000)
  return now >= remindAt && now < startAt
}

function isPendingNow(task: StaffTaskView, today: string) {
  if (!isOpenTask(task)) return false
  if (!(task.startsOn || task.scheduledOn)) return true
  return taskTouchesDate(task, today)
}

function reminderKey(row: ReminderRow) {
  return `${row.member_id}:${row.task_id ?? "digest"}:${row.kind}:${row.sent_for_date}`
}

async function loadSentKeys(today: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("staff_task_reminders")
    .select("member_id, task_id, kind, sent_for_date")
    .gte("sent_for_date", today)

  if (error) {
    console.error("Failed to load task reminders", error)
    throw new Error(
      "Unable to load reminder log. Run supabase/staff-task-reminders.sql in Supabase."
    )
  }

  return new Set(
    (data ?? []).map((row) =>
      reminderKey({
        member_id: row.member_id,
        task_id: row.task_id,
        kind: row.kind as ReminderKind,
        sent_for_date: row.sent_for_date,
      })
    )
  )
}

async function recordReminders(rows: ReminderRow[]) {
  if (rows.length === 0) return
  const supabase = createAdminClient()
  const { error } = await supabase.from("staff_task_reminders").insert(rows)
  if (error) {
    console.error("Failed to record task reminders", error)
  }
}

function taskLine(task: StaffTaskView) {
  const when =
    formatTaskSchedule(
      task.startsOn,
      task.startTime,
      task.endsOn,
      task.endTime
    ) || "No date"
  const meta = [
    STAFF_TASK_STATUS_LABELS[task.status],
    STAFF_TASK_PRIORITY_LABELS[task.priority],
    when || "No date",
  ].join(" · ")

  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;">
        <p style="margin:0;font-size:15px;font-weight:700;color:#0b2c66;">
          ${escapeHtml(task.title)}
        </p>
        <p style="margin:4px 0 0;font-size:13px;color:#64748b;">
          ${escapeHtml(meta)}
        </p>
      </td>
    </tr>
  `
}

function sectionHtml(title: string, tasks: StaffTaskView[]) {
  if (tasks.length === 0) return ""
  return `
    <h2 style="margin:24px 0 8px;font-size:14px;letter-spacing:0.12em;text-transform:uppercase;color:#eaaa33;">
      ${escapeHtml(title)}
    </h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${tasks.map(taskLine).join("")}
    </table>
  `
}

async function sendReminderEmail({
  to,
  name,
  overdue,
  upcoming,
  pending,
}: {
  to: string
  name: string
  overdue: StaffTaskView[]
  upcoming: StaffTaskView[]
  pending: StaffTaskView[]
}) {
  const parts = [
    overdue.length ? `${overdue.length} overdue` : "",
    upcoming.length ? `${upcoming.length} upcoming` : "",
    pending.length ? `${pending.length} pending` : "",
  ].filter(Boolean)

  await sendTransactionalEmail({
    to,
    toName: name,
    subject: `Task reminder: ${parts.join(", ")}`,
    html: `
      <div style="margin:0;padding:24px;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
          <div style="background:#0b2c66;padding:24px 28px;">
            <p style="margin:0;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#eaaa33;font-weight:700;">
              Techyx360
            </p>
            <h1 style="margin:8px 0 0;font-size:22px;color:#ffffff;">
              Your task reminder
            </h1>
          </div>
          <div style="padding:28px;">
            <p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:#1f2937;">
              Hi ${escapeHtml(name.split(" ")[0] || name)},
            </p>
            <p style="margin:0;font-size:16px;line-height:1.6;color:#1f2937;">
              Here is a quick look at your tasks.
            </p>
            ${sectionHtml("Overdue", overdue)}
            ${sectionHtml("Upcoming", upcoming)}
            ${sectionHtml("Pending", pending)}
            <p style="margin:28px 0 0;">
              <a href="${siteUrl}/admin/work" style="display:inline-block;padding:12px 20px;background:#0b2c66;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;">
                Open Tasks
              </a>
            </p>
          </div>
        </div>
        <p style="max-width:560px;margin:16px auto 0;font-size:12px;color:#9ca3af;">
          Techyx360 Technologies Limited · This is an automated reminder.
        </p>
      </div>
    `,
  })
}

export async function runTaskReminders() {
  if (!isTaskReminderEmailConfigured()) {
    return { sent: 0, skipped: true, reason: "Email is not configured." }
  }

  const now = new Date()
  const { date: today, hour } = lagosNow()
  const sendDigest = hour >= DIGEST_HOUR
  const tasks = await getAllStaffTasks()
  const sent = await loadSentKeys(today)
  const byMember = new Map<
    string,
    {
      email: string
      name: string
      overdue: StaffTaskView[]
      upcoming: StaffTaskView[]
      pending: StaffTaskView[]
      records: ReminderRow[]
    }
  >()

  function bucket(task: StaffTaskView) {
    const member = task.assignee
    if (!member || member.status === "inactive" || !member.email.includes("@")) {
      return null
    }
    const current = byMember.get(member.id) ?? {
      email: member.email,
      name: member.fullName,
      overdue: [],
      upcoming: [],
      pending: [],
      records: [],
    }
    byMember.set(member.id, current)
    return current
  }

  for (const task of tasks) {
    if (!isOpenTask(task) || !task.assigneeId) continue
    const group = bucket(task)
    if (!group) continue

    if (isOverdueNow(task, today)) {
      const row: ReminderRow = {
        member_id: task.assigneeId,
        task_id: task.id,
        kind: "overdue",
        sent_for_date: today,
      }
      if (sendDigest && !sent.has(reminderKey(row))) {
        group.overdue.push(task)
        group.records.push(row)
      }
      continue
    }

    if (isUpcomingNow(task, now)) {
      const row: ReminderRow = {
        member_id: task.assigneeId,
        task_id: task.id,
        kind: "upcoming",
        sent_for_date: task.startsOn ?? task.scheduledOn ?? today,
      }
      if (!sent.has(reminderKey(row))) {
        group.upcoming.push(task)
        group.records.push(row)
      }
    }

    if (sendDigest && isPendingNow(task, today)) {
      const digestRow: ReminderRow = {
        member_id: task.assigneeId,
        task_id: null,
        kind: "pending",
        sent_for_date: today,
      }
      const alreadyListed =
        group.overdue.some((item) => item.id === task.id) ||
        group.upcoming.some((item) => item.id === task.id)
      if (!alreadyListed && !sent.has(reminderKey(digestRow))) {
        group.pending.push(task)
        if (
          !group.records.some(
            (item) => reminderKey(item) === reminderKey(digestRow)
          )
        ) {
          group.records.push(digestRow)
        }
      }
    }
  }

  let sentCount = 0
  for (const group of byMember.values()) {
    if (
      group.overdue.length === 0 &&
      group.upcoming.length === 0 &&
      group.pending.length === 0
    ) {
      continue
    }

    await sendReminderEmail({
      to: group.email,
      name: group.name,
      overdue: group.overdue,
      upcoming: group.upcoming,
      pending: group.pending,
    })
    await recordReminders(group.records)
    sentCount += 1
  }

  return { sent: sentCount, skipped: false, digest: sendDigest, date: today }
}
