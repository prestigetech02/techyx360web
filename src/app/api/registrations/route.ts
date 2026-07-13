import { NextResponse } from "next/server"

import type { RegistrationType } from "@/lib/registrations"
import { evaCourseSlug } from "@/config/executive-virtual-assistance"
import { recaptchaActions } from "@/lib/recaptcha/actions"
import { requireRecaptcha } from "@/lib/recaptcha/server"
import { uploadRegistrationReceipt } from "@/lib/registrations/receipt-upload"
import type { Database } from "@/types/database"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

const ALLOWED_REGISTRATION_TYPES = new Set<RegistrationType>([
  "course",
  "siwes",
  "corporate",
])

type CourseRegistrationInsert =
  Database["public"]["Tables"]["course_registrations"]["Insert"]

type MutableCourseRegistrationInsert = {
  [K in keyof CourseRegistrationInsert]: CourseRegistrationInsert[K]
}

type RegistrationRequestBody = Record<string, unknown> & {
  paymentReceipt?: File
}

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

async function parseRegistrationRequest(
  request: Request
): Promise<RegistrationRequestBody> {
  const contentType = request.headers.get("content-type") ?? ""

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData()
    const body: RegistrationRequestBody = {}

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        if (key === "paymentReceipt" && value.size > 0) {
          body.paymentReceipt = value
        }
        continue
      }

      body[key] = value
    }

    return body
  }

  return (await request.json()) as RegistrationRequestBody
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

function appendMessageSection(
  existingMessage: string | null | undefined,
  section: string
) {
  if (!existingMessage?.trim()) return section
  return `${section}\n\n${existingMessage}`
}

function getMissingColumn(error: { code?: string; message?: string }) {
  if (error.code !== "PGRST204") return null

  const match = error.message?.match(/Could not find the '([^']+)' column/)
  return match?.[1] ?? null
}

function preserveStrippedColumnInMessage(
  column: string,
  value: unknown,
  message: string | null
) {
  if (value === null || value === undefined || value === "") {
    return message
  }

  switch (column) {
    case "registration_type":
      return appendMessageSection(
        message,
        `Registration type: ${String(value)}`
      )
    case "location":
      return appendMessageSection(message, `Location: ${String(value)}`)
    case "has_working_computer":
      return appendMessageSection(
        message,
        `Has working computer: ${value ? "Yes" : "No"}`
      )
    case "can_devote_6_hours_weekly":
      return appendMessageSection(
        message,
        `Can devote 6 hours/week: ${value ? "Yes" : "No"}`
      )
    case "payment_receipt_path":
      return appendMessageSection(
        message,
        `Payment receipt uploaded: ${String(value)}`
      )
    default:
      return message
  }
}

async function insertCourseRegistration(
  supabase: ReturnType<typeof createAdminClient>,
  payload: CourseRegistrationInsert
) {
  let currentPayload: MutableCourseRegistrationInsert = { ...payload }
  let lastError: { code?: string; message?: string } | null = null

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const { error } = await supabase
      .from("course_registrations")
      .insert(currentPayload)

    if (!error) {
      return null
    }

    lastError = error

    const missingColumn = getMissingColumn(error)
    if (!missingColumn || !(missingColumn in currentPayload)) {
      return error
    }

    console.warn(
      `course_registrations insert retry ${attempt + 1}: stripping column '${missingColumn}'`
    )

    const strippedValue =
      currentPayload[missingColumn as keyof MutableCourseRegistrationInsert]
    const nextPayload = { ...currentPayload } as MutableCourseRegistrationInsert
    delete nextPayload[missingColumn as keyof MutableCourseRegistrationInsert]

    currentPayload = {
      ...nextPayload,
      message: preserveStrippedColumnInMessage(
        missingColumn,
        strippedValue,
        nextPayload.message ?? null
      ),
    }
  }

  return lastError
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured yet." },
      { status: 500 }
    )
  }

  try {
    const body = await parseRegistrationRequest(request)

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
    const paymentReceipt = body.paymentReceipt
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

      if (!(paymentReceipt instanceof File) || paymentReceipt.size === 0) {
        return NextResponse.json(
          { error: "Please upload your payment receipt before submitting." },
          { status: 400 }
        )
      }
    }

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

    let paymentReceiptPath: string | null = null

    if (isEvaRegistration && paymentReceipt instanceof File) {
      const uploadResult = await uploadRegistrationReceipt(
        paymentReceipt,
        courseSlug
      )

      if ("error" in uploadResult) {
        return NextResponse.json({ error: uploadResult.error }, { status: 400 })
      }

      paymentReceiptPath = uploadResult.path
    }

    const registrationPayload: CourseRegistrationInsert = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      school_id: schoolId,
      school_name: schoolName,
      course_slug: courseSlug,
      course_title: courseTitle,
      course_key: courseKey,
      message:
        isEvaRegistration &&
        hasWorkingComputer !== null &&
        canDevote6HoursWeekly !== null
          ? formatEvaMessageExtras({
              location,
              hasWorkingComputer,
              canDevote6HoursWeekly,
              existingMessage: message || undefined,
            })
          : message || null,
      registration_type: registrationType,
    }

    if (
      isEvaRegistration &&
      hasWorkingComputer !== null &&
      canDevote6HoursWeekly !== null
    ) {
      registrationPayload.location = location
      registrationPayload.has_working_computer = hasWorkingComputer
      registrationPayload.can_devote_6_hours_weekly = canDevote6HoursWeekly
      registrationPayload.payment_receipt_path = paymentReceiptPath
    }

    const insertError = await insertCourseRegistration(
      supabase,
      registrationPayload
    )

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
