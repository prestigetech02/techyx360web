import { NextResponse } from "next/server"

import { activatePifFellowOnLogin } from "@/lib/pif/fellows"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    )
  }

  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getClaims()
    const email =
      typeof data?.claims?.email === "string" ? data.claims.email.trim() : ""
    const authUserId =
      typeof data?.claims?.sub === "string" ? data.claims.sub : null

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const fellow = await activatePifFellowOnLogin({ email, authUserId })
    return NextResponse.json({
      success: true,
      fellow: {
        id: fellow.id,
        fullName: fellow.fullName,
        email: fellow.email,
        status: fellow.status,
      },
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "This account is not registered as a PIF fellow."
    return NextResponse.json({ error: message }, { status: 403 })
  }
}
