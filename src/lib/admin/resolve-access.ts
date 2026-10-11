import {
  firstAllowedPath,
  fullAdminAccess,
  isDashboardAccessRole,
  normalizeStaffModules,
  parseModuleList,
  type DashboardAccess,
} from "@/lib/admin/access"
import {
  canFellowAccessPortal,
  isPifFellowStatus,
} from "@/lib/pif/fellow-types"
import { PIF_ATTENDANCE_HOME_PATH } from "@/lib/pifattendance/auth-paths"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

export type AccountPortal =
  | { kind: "staff"; access: DashboardAccess }
  | { kind: "pif_fellow"; email: string }
  | { kind: "none" }

/**
 * Role-based portal access (no env allowlist):
 * - Admin/staff dashboard: active/on_leave row in team_members
 * - PIF attendance: invited/active row in pif_fellows
 * - Otherwise: no access
 *
 * If an email is both staff and fellow, staff wins for /admin.
 */
export async function resolveStaffAccess(
  email: string
): Promise<DashboardAccess | null> {
  const normalized = email.trim().toLowerCase()
  if (!normalized || !isSupabaseConfigured()) {
    return null
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("team_members")
      .select("id, email, access_role, modules, status")
      .ilike("email", normalized)
      .maybeSingle()

    if (error || !data) {
      return null
    }

    if (data.status === "inactive") {
      return null
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
    return null
  }
}

export async function resolveAccountPortal(
  email: string
): Promise<AccountPortal> {
  const access = await resolveStaffAccess(email)
  if (access) {
    return { kind: "staff", access }
  }

  try {
    const supabase = createAdminClient()
    const { data: fellow } = await supabase
      .from("pif_fellows")
      .select("status")
      .ilike("email", email.trim().toLowerCase())
      .maybeSingle()

    if (
      fellow &&
      isPifFellowStatus(fellow.status) &&
      canFellowAccessPortal(fellow.status)
    ) {
      return { kind: "pif_fellow", email: email.trim() }
    }
  } catch {
    // ignore — treat as none
  }

  return { kind: "none" }
}

export function destinationForAccountPortal(portal: AccountPortal) {
  if (portal.kind === "staff") {
    return firstAllowedPath(portal.access)
  }
  if (portal.kind === "pif_fellow") {
    return PIF_ATTENDANCE_HOME_PATH
  }
  return "/admin/login"
}
