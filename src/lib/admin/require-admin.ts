import { NextResponse } from "next/server"

import { hasModule, type AdminModuleKey } from "@/lib/admin/access"
import { resolveStaffAccess } from "@/lib/admin/resolve-access"
import { createClient } from "@/lib/supabase/server"

export async function getDashboardAccess() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) return null

  const email =
    typeof data.claims.email === "string" ? data.claims.email.trim() : ""
  if (!email) return null

  return resolveStaffAccess(email)
}

export async function requireAdmin(module?: AdminModuleKey | "any") {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims) {
    return {
      authorized: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  const email =
    typeof data.claims.email === "string" ? data.claims.email.trim() : ""
  const access = await resolveStaffAccess(email)

  if (module && !hasModule(access, module)) {
    return {
      authorized: false as const,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    }
  }

  return { authorized: true as const, email, access }
}
