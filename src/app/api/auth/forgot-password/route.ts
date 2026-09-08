import { NextResponse } from "next/server"

import { sendPasswordResetLink } from "@/lib/auth/staff-auth-email"
import { isTransactionalEmailConfigured } from "@/lib/email/zeptomail"
import { isSupabaseConfigured } from "@/lib/supabase/env"

export const runtime = "nodejs"

function readEmail(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    )
  }

  if (!isTransactionalEmailConfigured()) {
    return NextResponse.json(
      {
        error:
          "Email is not configured. Add ZEPTOMAIL_TOKEN and ZEPTOMAIL_FROM_EMAIL.",
      },
      { status: 500 }
    )
  }

  try {
    const body = (await request.json().catch(() => null)) as
      | { email?: unknown }
      | null
    const email = readEmail(body?.email)

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Enter the email address you use to sign in." },
        { status: 400 }
      )
    }

    await sendPasswordResetLink(email)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to send password reset email", error)
    return NextResponse.json(
      { error: "Unable to send reset email right now. Please try again." },
      { status: 500 }
    )
  }
}
