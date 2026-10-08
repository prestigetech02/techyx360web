import "server-only"

import { redirect } from "next/navigation"

import {
  PIF_ATTENDANCE_LOGIN_PATH,
} from "@/lib/pifattendance/auth-paths"
import {
  activatePifFellowOnLogin,
  getPifFellowByEmail,
} from "@/lib/pif/fellows"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"

export async function requirePifFellow() {
  if (!isSupabaseConfigured()) {
    redirect(PIF_ATTENDANCE_LOGIN_PATH)
  }

  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims) {
    redirect(PIF_ATTENDANCE_LOGIN_PATH)
  }

  const email =
    typeof data.claims.email === "string" ? data.claims.email.trim() : ""
  const authUserId =
    typeof data.claims.sub === "string" ? data.claims.sub : null

  if (!email) {
    redirect(PIF_ATTENDANCE_LOGIN_PATH)
  }

  try {
    const fellow = await activatePifFellowOnLogin({ email, authUserId })
    return { fellow, email }
  } catch {
    await supabase.auth.signOut()
    redirect(PIF_ATTENDANCE_LOGIN_PATH)
  }
}

export async function getOptionalPifFellowSession() {
  if (!isSupabaseConfigured()) return null

  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) return null

  const email =
    typeof data.claims.email === "string" ? data.claims.email.trim() : ""
  if (!email) return null

  const fellow = await getPifFellowByEmail(email)
  if (!fellow) return null
  return { fellow, email }
}
