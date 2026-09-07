import {
  fullAdminAccess,
  isDashboardAccessRole,
  normalizeStaffModules,
  parseModuleList,
  type DashboardAccess,
} from "@/lib/admin/access"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

export async function resolveStaffAccess(
  email: string
): Promise<DashboardAccess> {
  const normalized = email.trim().toLowerCase()
  if (!normalized || !isSupabaseConfigured()) {
    return fullAdminAccess(email.trim())
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("team_members")
      .select("id, email, access_role, modules, status")
      .ilike("email", normalized)
      .maybeSingle()

    if (error || !data) {
      return fullAdminAccess(email.trim())
    }

    const role = isDashboardAccessRole(data.access_role)
      ? data.access_role
      : "admin"

    if (role === "admin") {
      return {
        kind: "admin",
        email: email.trim(),
        memberId: data.id,
        modules: fullAdminAccess(email.trim()).modules,
      }
    }

    return {
      kind: "staff",
      email: email.trim(),
      memberId: data.id,
      modules: normalizeStaffModules(parseModuleList(data.modules)),
    }
  } catch {
    return fullAdminAccess(email.trim())
  }
}
