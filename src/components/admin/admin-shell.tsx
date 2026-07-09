import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

type AdminShellProps = {
  children: React.ReactNode
  userEmail?: string | null
}

export function AdminShell({ children, userEmail }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[#f4f6fa]">
      <div className="flex min-h-screen">
        <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block">
          <AdminSidebar />
        </div>

        <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
          <AdminHeader userEmail={userEmail} />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
