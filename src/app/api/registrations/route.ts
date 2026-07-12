import { NextResponse } from "next/server"

import type { RegistrationType } from "@/lib/registrations"
import { evaCourseSlug } from "@/config/executive-virtual-assistance"
import { recaptchaActions } from "@/lib/recaptcha/actions"
import { requireRecaptcha } from "@/lib/recaptcha/server"
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

function parseYesNo(value: unknown) {
  if (typeof value === "boolean") return value

  const normalized = sanitize(value).toLowerCase()

  if (normalized === "yes" || normalized === "true") return true
  if (normalized === "no" || normalized === "false") return false

  return null
}

function formatEvaMessageExtras(input: {
  location: string
  hasWorkingComputer: boolean
  canDevote6HoursWeekly: boolean
  existingMessage?: string
}) {
  const lines = [
    "EVA application details:",
    `Location: ${input.location}`,
    `Has working computer: ${input.hasWorkingComputer ? "Yes" : "No"}`,
    `Can devote 6 hours/week: ${input.canDevote6HoursWeekly ? "Yes" : "No"}`,
  ]

  if (input.existingMessage) {
    lines.push("", input.existingMessage)
  }

  return lines.join("\n")
}

function isMissingColumnError(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? ""

  return (
    error.code === "PGRST204" ||
    (message.includes("column") && message.includes("does not exist"))
  )
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
      recaptchaActions.courseRegistration
    )
    if (recaptchaError) return recaptchaError

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
    const location = sanitize(body.location)
    const hasWorkingComputer = parseYesNo(body.hasWorkingComputer)
    const canDevote6HoursWeekly = parseYesNo(body.canDevote6HoursWeekly)
    const isEvaRegistration = courseSlug === evaCourseSlug

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

    if (isEvaRegistration) {
      if (!location) {
        return NextResponse.json(
          { error: "Location is required for EVA registration." },
          { status: 400 }
        )
      }

      if (hasWorkingComputer === null) {
        return NextResponse.json(
          { error: "Please indicate if you have a working computer." },
          { status: 400 }
        )
      }

      if (canDevote6HoursWeekly === null) {
        return NextResponse.json(
          {
            error:
              "Please indicate if you can devote a maximum of 6 hours per week.",
          },
          { status: 400 }
        )
      }
    }

    const supabase = createAdminClient()
    const baseRegistration = {
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
    }

    let insertError = null

    if (isEvaRegistration) {
      const evaRegistration = {
        ...baseRegistration,
        location,
        has_working_computer: hasWorkingComputer,
        can_devote_6_hours_weekly: canDevote6HoursWeekly,
      }

      const { error } = await supabase
        .from("course_registrations")
        .insert(evaRegistration)

      if (error && isMissingColumnError(error)) {
        console.warn(
          "EVA registration columns missing; saving details in message field",
          error
        )

        const { error: fallbackError } = await supabase
          .from("course_registrations")
          .insert({
            ...baseRegistration,
            message: formatEvaMessageExtras({
              location,
              hasWorkingComputer,
              canDevote6HoursWeekly,
              existingMessage: message || undefined,
            }),
          })

        insertError = fallbackError
      } else {
        insertError = error
      }
    } else {
      const { error } = await supabase
        .from("course_registrations")
        .insert(baseRegistration)

      insertError = error
    }

    if (insertError) {
      console.error("Failed to save course registration", insertError)
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
