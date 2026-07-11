import { NextResponse } from "next/server"

import { recaptchaActions } from "@/lib/recaptcha/actions"
import { requireRecaptcha } from "@/lib/recaptcha/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured yet." },
      { status: 500 }
    )
  }

  try {
    const body = (await request.json()) as Record<string, unknown>

    const recaptchaError = await requireRecaptcha(
      body,
      recaptchaActions.contact
    )
    if (recaptchaError) return recaptchaError

    const firstName = sanitize(body.firstName)
    const lastName = sanitize(body.lastName)
    const email = sanitize(body.email).toLowerCase()
    const phone = sanitize(body.phone)
    const message = sanitize(body.message)

    if (!firstName || !lastName || !email || !phone || !message) {
      return NextResponse.json(
        { error: "All contact form fields are required." },
        { status: 400 }
      )
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from("contact_submissions").insert({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      message,
    })

    if (error) {
      console.error("Failed to save contact submission", error)
      return NextResponse.json(
        { error: "Unable to save your message right now." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected contact submission error", error)
    return NextResponse.json(
      { error: "Unable to process your message right now." },
      { status: 500 }
    )
  }
}
