import { AdminHeader } from "@/components/admin/admin-header"
import { AdminNotificationsProvider } from "@/components/admin/admin-notifications-provider"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

type AdminShellProps = {
  children: React.ReactNode
  userEmail?: string | null
}

export function AdminShell({ children, userEmail }: AdminShellProps) {
  return (
    <AdminNotificationsProvider>
      <div className="min-h-screen bg-muted/40">
        <div className="flex min-h-screen">
          <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block">
            <AdminSidebar />
          </div>

          <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden lg:pl-64">
            <AdminHeader userEmail={userEmail} />
            <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6">{children}</main>
          </div>
        </div>
      </div>
    </AdminNotificationsProvider>
  )
}
