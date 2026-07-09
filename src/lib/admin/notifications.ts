import type { Database } from "@/types/database"

export type ContactSubmissionRow =
  Database["public"]["Tables"]["contact_submissions"]["Row"]

export type CourseRegistrationRow =
  Database["public"]["Tables"]["course_registrations"]["Row"]

export type AdminNotification = {
  id: string
  type: "contact" | "registration"
  firstName: string
  lastName: string
  email: string
  message: string
  createdAt: string
  href: string
  label: string
}

export function mapSubmissionToNotification(
  row: Pick<
    ContactSubmissionRow,
    "id" | "first_name" | "last_name" | "email" | "message" | "created_at"
  >
): AdminNotification {
  return {
    id: `contact:${row.id}`,
    type: "contact",
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    message: row.message,
    createdAt: row.created_at,
    href: "/admin/contact",
    label: "New contact enquiry",
  }
}

export function mapRegistrationToNotification(
  row: Pick<
    CourseRegistrationRow,
    | "id"
    | "first_name"
    | "last_name"
    | "email"
    | "message"
    | "created_at"
    | "course_title"
  > & {
    registration_type?: string
  }
): AdminNotification {
  const typeLabel =
    row.registration_type === "siwes"
      ? "SIWES application"
      : row.registration_type === "corporate"
        ? "Corporate training request"
        : "Course registration"

  return {
    id: `registration:${row.id}`,
    type: "registration",
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    message: row.message ?? row.course_title,
    createdAt: row.created_at,
    href: "/admin/registrations",
    label: typeLabel,
  }
}

export function formatNotificationTime(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime()
  const minutes = Math.floor(diff / 60_000)

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function truncateNotificationMessage(message: string, maxLength = 72) {
  if (message.length <= maxLength) return message
  return `${message.slice(0, maxLength).trimEnd()}…`
}

export function registrationTypeLabel(type: string) {
  switch (type) {
    case "siwes":
      return "SIWES"
    case "corporate":
      return "Corporate"
    default:
      return "Course"
  }
}
