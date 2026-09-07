import { NextResponse } from "next/server"
import type { EmailOtpType } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/env"

function safeNextPath(value: string | null, type: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return type === "recovery" ? "/admin/reset-password" : "/admin/accept-invite"
  }
  return value
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const type = searchParams.get("type") as EmailOtpType | null
  const next = safeNextPath(searchParams.get("next"), type)
  const fallbackPath =
    type === "recovery" ? "/admin/reset-password" : "/admin/accept-invite"
  const acceptUrl = new URL(fallbackPath, origin)
  acceptUrl.searchParams.set("error", "invalid")

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(acceptUrl)
  }

  const token_hash = searchParams.get("token_hash")

  if (!token_hash || !type) {
    return NextResponse.redirect(acceptUrl)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash,
  })

  if (error) {
    console.error("Failed to verify auth invite", error)
    return NextResponse.redirect(acceptUrl)
  }

  return NextResponse.redirect(new URL(next, origin))
}
