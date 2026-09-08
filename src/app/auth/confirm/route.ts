import { NextResponse, type NextRequest } from "next/server"
import type { EmailOtpType } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"

import type { Database } from "@/types/database"
import { isSupabaseConfigured, getSupabasePublicEnv } from "@/lib/supabase/env"

const OTP_TYPES: EmailOtpType[] = [
  "recovery",
  "invite",
  "email",
  "magiclink",
  "signup",
]

function safeNextPath(value: string | null, type: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return type === "recovery" ? "/admin/reset-password" : "/admin/accept-invite"
  }
  return value
}

function fallbackPath(type: string | null, next: string) {
  if (type === "recovery" || next.includes("reset-password")) {
    return "/admin/reset-password"
  }
  return "/admin/accept-invite"
}

function otpTypesToTry(type: string | null): EmailOtpType[] {
  const preferred = OTP_TYPES.find((item) => item === type) ?? "recovery"
  return preferred === "recovery" ? ["recovery"] : [preferred, "recovery"]
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const type = searchParams.get("type")
  const next = safeNextPath(searchParams.get("next"), type)
  const tokenHash = searchParams.get("token_hash")
  const code = searchParams.get("code")
  const successUrl = new URL(next, origin)
  const failUrl = new URL(fallbackPath(type, next), origin)
  failUrl.searchParams.set("error", "invalid")

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(failUrl)
  }

  const { url, anonKey } = getSupabasePublicEnv()
  let response = NextResponse.redirect(successUrl)

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })
        response = NextResponse.redirect(successUrl)
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  if (tokenHash) {
    let verified = false
    for (const otpType of otpTypesToTry(type)) {
      const { error } = await supabase.auth.verifyOtp({
        type: otpType,
        token_hash: tokenHash,
      })
      if (!error) {
        verified = true
        break
      }
    }

    if (!verified) {
      return NextResponse.redirect(failUrl)
    }

    return response
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(failUrl)
    }
    return response
  }

  return NextResponse.redirect(failUrl)
}
