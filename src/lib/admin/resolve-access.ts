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
 * Staff dashboard access only. Fail-closed: unknown emails get no access.
 * PIF fellows are not team members and must never receive admin access here.
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

    // Inactive staff cannot use the admin dashboard.
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

/** Resolve whether this auth email is staff, a PIF fellow, or neither. */
export async function resolveAccountPortal(
  email: string
): Promise<AccountPortal> {
  const access = await resolveStaffAccess(email)
  if (access) {
    return { kind: "staff", access }
  }

  try {
    // Inline lookup so this module stays usable from middleware
    // (avoids importing server-only fellow helpers).
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
