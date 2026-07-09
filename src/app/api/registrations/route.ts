import { NextResponse } from "next/server"

import type { RegistrationType } from "@/lib/registrations"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

const ALLOWED_REGISTRATION_TYPES = new Set<RegistrationType>([
  "course",
  "siwes",
  "corporate",
])

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

    const firstName = sanitize(body.firstName)
    const lastName = sanitize(body.lastName)
    const email = sanitize(body.email).toLowerCase()
    const phone = sanitize(body.phone)
    const schoolId = sanitize(body.schoolId)
    const schoolName = sanitize(body.schoolName)
    const courseSlug = sanitize(body.courseSlug)
    const courseTitle = sanitize(body.courseTitle)
    const courseKey = sanitize(body.courseKey)
    const message = sanitize(body.message)
    const registrationType = sanitize(body.registrationType) || "course"

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !schoolId ||
      !schoolName ||
      !courseSlug ||
      !courseTitle ||
      !courseKey
    ) {
      return NextResponse.json(
        { error: "All required registration fields must be provided." },
        { status: 400 }
      )
    }

    if (!ALLOWED_REGISTRATION_TYPES.has(registrationType as RegistrationType)) {
      return NextResponse.json(
        { error: "Invalid registration type." },
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
    const { error } = await supabase.from("course_registrations").insert({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      school_id: schoolId,
      school_name: schoolName,
      course_slug: courseSlug,
      course_title: courseTitle,
      course_key: courseKey,
      message: message || null,
      registration_type: registrationType,
    })

    if (error) {
      console.error("Failed to save course registration", error)
      return NextResponse.json(
        { error: "Unable to save your registration right now." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected course registration error", error)
    return NextResponse.json(
      { error: "Unable to process your registration right now." },
      { status: 500 }
    )
  }
}
