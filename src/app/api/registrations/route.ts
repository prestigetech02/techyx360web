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

async function insertEvaRegistration(
  supabase: ReturnType<typeof createAdminClient>,
  baseRegistration: {
    first_name: string
    last_name: string
    email: string
    phone: string
    school_id: string
    school_name: string
    course_slug: string
    course_title: string
    course_key: string
    message: string | null
    registration_type: string
  },
  evaDetails: {
    location: string
    hasWorkingComputer: boolean
    canDevote6HoursWeekly: boolean
  },
  existingMessage: string
) {
  const evaRegistration = {
    ...baseRegistration,
    location: evaDetails.location,
    has_working_computer: evaDetails.hasWorkingComputer,
    can_devote_6_hours_weekly: evaDetails.canDevote6HoursWeekly,
  }

  const { error: fullInsertError } = await supabase
    .from("course_registrations")
    .insert(evaRegistration)

  if (!fullInsertError) {
    return null
  }

  console.error("EVA registration insert failed", fullInsertError)
  console.warn(
    "Retrying EVA registration without dedicated columns and storing details in message"
  )

  const { error: fallbackError } = await supabase
    .from("course_registrations")
    .insert({
      ...baseRegistration,
      message: formatEvaMessageExtras({
        location: evaDetails.location,
        hasWorkingComputer: evaDetails.hasWorkingComputer,
        canDevote6HoursWeekly: evaDetails.canDevote6HoursWeekly,
        existingMessage: existingMessage || undefined,
      }),
    })

  if (fallbackError) {
    console.error("EVA registration fallback insert failed", fallbackError)
  }

  return fallbackError
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

    const evaDetails =
      isEvaRegistration &&
      hasWorkingComputer !== null &&
      canDevote6HoursWeekly !== null
        ? {
            location,
            hasWorkingComputer,
            canDevote6HoursWeekly,
          }
        : null

    const supabase = (() => {
      try {
        return createAdminClient()
      } catch (error) {
        console.error("Unable to create Supabase admin client", error)
        return null
      }
    })()

    if (!supabase) {
      return NextResponse.json(
        {
          error:
            "Registration service is not configured correctly. Please contact support.",
        },
        { status: 500 }
      )
    }

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

    if (evaDetails) {
      insertError = await insertEvaRegistration(
        supabase,
        baseRegistration,
        evaDetails,
        message
      )
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
