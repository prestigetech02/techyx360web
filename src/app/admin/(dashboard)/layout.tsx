import { redirect } from "next/navigation"

import { AdminShell } from "@/components/admin/admin-shell"
import {
  destinationForAccountPortal,
  resolveAccountPortal,
} from "@/lib/admin/resolve-access"
import { getDashboardAccess } from "@/lib/admin/require-admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!isSupabaseConfigured()) {
    redirect("/admin/login")
  }

  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims) {
    redirect("/admin/login")
  }

  const userEmail =
    typeof data.claims.email === "string" ? data.claims.email.trim() : null
  if (!userEmail) {
    redirect("/admin/login")
  }

  const access = await getDashboardAccess()
  if (!access) {
    const portal = await resolveAccountPortal(userEmail)
    redirect(destinationForAccountPortal(portal))
  }

  return (
    <AdminShell userEmail={userEmail} access={access}>
      {children}
    </AdminShell>
  )
}
