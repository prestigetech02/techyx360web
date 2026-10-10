import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import type { Database } from "@/types/database"
import { canAccessPath, firstAllowedPath } from "@/lib/admin/access"
import { isPublicAdminAuthPath } from "@/lib/admin/auth-callback"
import {
  destinationForAccountPortal,
  resolveAccountPortal,
  resolveStaffAccess,
} from "@/lib/admin/resolve-access"
import { isPifAttendancePath } from "@/lib/pifattendance/auth-paths"
import { getSupabasePublicEnv } from "@/lib/supabase/env"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const { url, anonKey } = getSupabasePublicEnv()

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })

        supabaseResponse = NextResponse.next({
          request,
        })

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options)
        })
      },
    },
  })

  // Refresh the auth session when present.
  const { data } = await supabase.auth.getClaims()
  const path = request.nextUrl.pathname
  const isAdminPage = path === "/admin" || path.startsWith("/admin/")
  const isAdminApi = path.startsWith("/api/admin")
  const isPifPortal = isPifAttendancePath(path)

  // PIF attendance uses its own fellow gate in route layouts (not staff modules).
  if (isPifPortal) {
    return supabaseResponse
  }

  if (!isAdminPage && !isAdminApi) {
    return supabaseResponse
  }

  // Session probe used by admin login — must reach the route for fellows too.
  if (path === "/api/admin/session" || path.startsWith("/api/admin/session/")) {
    return supabaseResponse
  }

  if (isPublicAdminAuthPath(path)) {
    // Logged-in PIF fellows should not sit on admin auth pages.
    const email =
      typeof data?.claims?.email === "string" ? data.claims.email.trim() : ""
    if (email && (path === "/admin/login" || path.startsWith("/admin/login/"))) {
      const portal = await resolveAccountPortal(email)
      if (portal.kind === "pif_fellow") {
        return NextResponse.redirect(
          new URL(destinationForAccountPortal(portal), request.url)
        )
      }
      if (portal.kind === "staff") {
        return NextResponse.redirect(
          new URL(firstAllowedPath(portal.access), request.url)
        )
      }
    }
    return supabaseResponse
  }

  const email =
    typeof data?.claims?.email === "string" ? data.claims.email.trim() : ""

  if (!data?.claims || !email) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  const access = await resolveStaffAccess(email)
  if (access && canAccessPath(access, path)) {
    return supabaseResponse
  }

  if (isAdminApi) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Authenticated but not staff (e.g. PIF fellow) — keep them out of admin.
  const portal = await resolveAccountPortal(email)
  if (portal.kind === "staff") {
    const destination = firstAllowedPath(portal.access)
    if (destination === path) {
      return supabaseResponse
    }
    return NextResponse.redirect(new URL(destination, request.url))
  }

  return NextResponse.redirect(
    new URL(destinationForAccountPortal(portal), request.url)
  )
}
