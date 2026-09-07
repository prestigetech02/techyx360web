import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import type { Database } from "@/types/database"
import { canAccessPath, firstAllowedPath } from "@/lib/admin/access"
import { isPublicAdminAuthPath } from "@/lib/admin/auth-callback"
import { resolveStaffAccess } from "@/lib/admin/resolve-access"
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

  if (!isAdminPage && !isAdminApi) {
    return supabaseResponse
  }

  if (isPublicAdminAuthPath(path)) {
    return supabaseResponse
  }

  const email =
    typeof data?.claims?.email === "string" ? data.claims.email.trim() : ""

  if (!data?.claims || !email) {
    return supabaseResponse
  }

  const access = await resolveStaffAccess(email)
  if (canAccessPath(access, path)) {
    return supabaseResponse
  }

  if (isAdminApi) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const destination = firstAllowedPath(access)
  if (destination === path) {
    return supabaseResponse
  }

  return NextResponse.redirect(new URL(destination, request.url))
}
