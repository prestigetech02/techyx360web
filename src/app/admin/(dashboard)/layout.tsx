import { redirect } from "next/navigation"

import { AdminShell } from "@/components/admin/admin-shell"
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
    typeof data.claims.email === "string" ? data.claims.email : null

  return <AdminShell userEmail={userEmail}>{children}</AdminShell>
}
