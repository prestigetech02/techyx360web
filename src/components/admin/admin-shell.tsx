"use client"

import { useState } from "react"

import { AdminHeader } from "@/components/admin/admin-header"
import { AdminNotificationsProvider } from "@/components/admin/admin-notifications-provider"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { cn } from "@/lib/utils"

type AdminShellProps = {
  children: React.ReactNode
  userEmail?: string | null
}

export function AdminShell({ children, userEmail }: AdminShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <AdminNotificationsProvider>
      <div className="admin-ui h-dvh overflow-hidden bg-muted/40">
        <div className="flex h-full">
          <div
            className={cn(
              "hidden h-dvh overflow-hidden transition-[width] duration-300 lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block",
              sidebarCollapsed ? "lg:w-0" : "lg:w-72"
            )}
          >
            <AdminSidebar />
          </div>

          <div
            className={cn(
              "flex h-full min-w-0 flex-1 flex-col overflow-hidden transition-[padding] duration-300",
              sidebarCollapsed ? "lg:pl-0" : "lg:pl-72"
            )}
          >
            <AdminHeader
              userEmail={userEmail}
              sidebarCollapsed={sidebarCollapsed}
              onToggleSidebar={() =>
                setSidebarCollapsed((collapsed) => !collapsed)
              }
            />
            <main className="@container min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-4 sm:p-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AdminNotificationsProvider>
  )
}
