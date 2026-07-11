"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import {
  formatNotificationTime,
  mapPifApplicationToNotification,
  mapRegistrationToNotification,
  mapSubmissionToNotification,
  truncateNotificationMessage,
  type AdminNotification,
  type ContactSubmissionRow,
  type CourseRegistrationRow,
  type PifApplicationRow,
} from "@/lib/admin/notifications"
import { createClient } from "@/lib/supabase/client"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { notify } from "@/lib/toast"

type AdminNotificationsContextValue = {
  newCount: number
  contactCount: number
  registrationCount: number
  pifCount: number
  notifications: AdminNotification[]
  isLoading: boolean
  refresh: () => Promise<void>
}

const AdminNotificationsContext =
  createContext<AdminNotificationsContextValue | null>(null)

export function useAdminNotifications() {
  const context = useContext(AdminNotificationsContext)
  if (!context) {
    throw new Error(
      "useAdminNotifications must be used within AdminNotificationsProvider"
    )
  }
  return context
}

function sortNotifications(items: AdminNotification[]) {
  return [...items].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  )
}

async function fetchNewNotifications() {
  const supabase = createClient()
  const notifications: AdminNotification[] = []

  const contactResult = await supabase
    .from("contact_submissions")
    .select("id, first_name, last_name, email, message, status, created_at")
    .eq("status", "new")
    .order("created_at", { ascending: false })
    .limit(20)

  if (contactResult.error) {
    console.warn(
      "Contact notifications unavailable:",
      contactResult.error.message
    )
  } else {
    notifications.push(
      ...(contactResult.data ?? []).map(mapSubmissionToNotification)
    )
  }

  const registrationResult = await supabase
    .from("course_registrations")
    .select(
      "id, first_name, last_name, email, message, status, created_at, registration_type, course_title"
    )
    .eq("status", "new")
    .order("created_at", { ascending: false })
    .limit(20)

  let registrationRows: Parameters<typeof mapRegistrationToNotification>[0][] =
    []

  if (registrationResult.error) {
    const fallbackResult = await supabase
      .from("course_registrations")
      .select(
        "id, first_name, last_name, email, message, status, created_at, course_title"
      )
      .eq("status", "new")
      .order("created_at", { ascending: false })
      .limit(20)

    if (fallbackResult.error) {
      console.warn(
        "Registration notifications unavailable:",
        fallbackResult.error.message
      )
    } else {
      registrationRows = fallbackResult.data ?? []
    }
  } else {
    registrationRows = registrationResult.data ?? []
  }

  notifications.push(...registrationRows.map(mapRegistrationToNotification))

  const pifResult = await supabase
    .from("pif_applications")
    .select(
      "id, first_name, last_name, email, motivation, preferred_track, status, created_at"
    )
    .eq("status", "new")
    .order("created_at", { ascending: false })
    .limit(20)

  if (pifResult.error) {
    console.warn("PIF notifications unavailable:", pifResult.error.message)
  } else {
    notifications.push(
      ...(pifResult.data ?? []).map(mapPifApplicationToNotification)
    )
  }

  return sortNotifications(notifications).slice(0, 20)
}

export function AdminNotificationsProvider({
  children,
}: {
  children: ReactNode
}) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured())

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setNotifications([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      const nextNotifications = await fetchNewNotifications()
      setNotifications(nextNotifications)
    } catch (error) {
      console.error(
        "Failed to load admin notifications",
        error instanceof Error ? error.message : error
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!isSupabaseConfigured()) return

    const supabase = createClient()

    const channel = supabase
      .channel("admin-inbox")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "contact_submissions",
        },
        (payload) => {
          const row = payload.new as ContactSubmissionRow

          if (row.status !== "new") return

          const notification = mapSubmissionToNotification(row)

          setNotifications((current) => {
            if (current.some((item) => item.id === notification.id)) {
              return current
            }

            return sortNotifications([notification, ...current]).slice(0, 20)
          })

          notify.info(
            `New enquiry from ${notification.firstName} ${notification.lastName}`
          )

          router.refresh()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "contact_submissions",
        },
        (payload) => {
          const row = payload.new as ContactSubmissionRow
          const notificationId = `contact:${row.id}`

          if (row.status === "new") {
            const notification = mapSubmissionToNotification(row)
            setNotifications((current) => {
              if (current.some((item) => item.id === notification.id)) {
                return current
              }

              return sortNotifications([notification, ...current]).slice(0, 20)
            })
          } else {
            setNotifications((current) =>
              current.filter((item) => item.id !== notificationId)
            )
          }

          router.refresh()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "contact_submissions",
        },
        (payload) => {
          const row = payload.old as Pick<ContactSubmissionRow, "id">
          setNotifications((current) =>
            current.filter((item) => item.id !== `contact:${row.id}`)
          )
          router.refresh()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "course_registrations",
        },
        (payload) => {
          const row = payload.new as CourseRegistrationRow

          if (row.status !== "new") return

          const notification = mapRegistrationToNotification(row)

          setNotifications((current) => {
            if (current.some((item) => item.id === notification.id)) {
              return current
            }

            return sortNotifications([notification, ...current]).slice(0, 20)
          })

          notify.info(
            `${notification.label} from ${notification.firstName} ${notification.lastName}`
          )

          router.refresh()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "course_registrations",
        },
        (payload) => {
          const row = payload.new as CourseRegistrationRow
          const notificationId = `registration:${row.id}`

          if (row.status === "new") {
            const notification = mapRegistrationToNotification(row)
            setNotifications((current) => {
              if (current.some((item) => item.id === notification.id)) {
                return current
              }

              return sortNotifications([notification, ...current]).slice(0, 20)
            })
          } else {
            setNotifications((current) =>
              current.filter((item) => item.id !== notificationId)
            )
          }

          router.refresh()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "course_registrations",
        },
        (payload) => {
          const row = payload.old as Pick<CourseRegistrationRow, "id">
          setNotifications((current) =>
            current.filter((item) => item.id !== `registration:${row.id}`)
          )
          router.refresh()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "pif_applications",
        },
        (payload) => {
          const row = payload.new as PifApplicationRow

          if (row.status !== "new") return

          const notification = mapPifApplicationToNotification(row)

          setNotifications((current) => {
            if (current.some((item) => item.id === notification.id)) {
              return current
            }

            return sortNotifications([notification, ...current]).slice(0, 20)
          })

          notify.info(
            `PIF application from ${notification.firstName} ${notification.lastName}`
          )

          router.refresh()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "pif_applications",
        },
        (payload) => {
          const row = payload.new as PifApplicationRow
          const notificationId = `pif:${row.id}`

          if (row.status === "new") {
            const notification = mapPifApplicationToNotification(row)
            setNotifications((current) => {
              if (current.some((item) => item.id === notification.id)) {
                return current
              }

              return sortNotifications([notification, ...current]).slice(0, 20)
            })
          } else {
            setNotifications((current) =>
              current.filter((item) => item.id !== notificationId)
            )
          }

          router.refresh()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "pif_applications",
        },
        (payload) => {
          const row = payload.old as Pick<PifApplicationRow, "id">
          setNotifications((current) =>
            current.filter((item) => item.id !== `pif:${row.id}`)
          )
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [router])

  const value = useMemo(() => {
    const contactCount = notifications.filter(
      (item) => item.type === "contact"
    ).length
    const registrationCount = notifications.filter(
      (item) => item.type === "registration"
    ).length
    const pifCount = notifications.filter((item) => item.type === "pif").length

    return {
      newCount: notifications.length,
      contactCount,
      registrationCount,
      pifCount,
      notifications,
      isLoading,
      refresh,
    }
  }, [isLoading, notifications, refresh])

  return (
    <AdminNotificationsContext.Provider value={value}>
      {children}
    </AdminNotificationsContext.Provider>
  )
}

export function AdminNotificationsList({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  const { notifications, isLoading } = useAdminNotifications()

  if (isLoading) {
    return (
      <p className="px-4 py-6 text-center text-sm text-muted-foreground">
        Loading notifications...
      </p>
    )
  }

  if (notifications.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-sm text-muted-foreground">
        No new submissions.
      </p>
    )
  }

  return (
    <ul className="max-h-80 overflow-y-auto">
      {notifications.map((notification) => (
        <li key={notification.id}>
          <Link
            href={notification.href}
            onClick={onNavigate}
            className="block border-b border-border/60 px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/50"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wide text-brand uppercase">
                  {notification.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {notification.firstName} {notification.lastName}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatNotificationTime(notification.createdAt)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {notification.email}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">
              {truncateNotificationMessage(notification.message)}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  )
}
