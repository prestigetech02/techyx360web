import { NextResponse } from "next/server"

import {
  sendPasswordResetLink,
  sendPifPasswordResetLink,
} from "@/lib/auth/staff-auth-email"
import { getPifFellowByEmail } from "@/lib/pif/fellows"
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
      | { email?: unknown; portal?: unknown }
      | null
    const email = readEmail(body?.email)
    const portal =
      typeof body?.portal === "string" ? body.portal.trim().toLowerCase() : ""

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Enter the email address you use to sign in." },
        { status: 400 }
      )
    }

    if (portal === "pifattendance") {
      const fellow = await getPifFellowByEmail(email)
      if (!fellow) {
        // Avoid email enumeration; still return success.
        return NextResponse.json({ success: true })
      }
      await sendPifPasswordResetLink(email)
    } else {
      await sendPasswordResetLink(email)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to send password reset email", error)
    return NextResponse.json(
      { error: "Unable to send reset email right now. Please try again." },
      { status: 500 }
    )
  }
}
