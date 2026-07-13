import { findCourseBySlug } from "@/config/training-schools"
import { recaptchaActions } from "@/lib/recaptcha/actions"
import { getRecaptchaToken } from "@/lib/recaptcha/client"

export type RegistrationType = "course" | "siwes" | "corporate"

export type CourseRegistrationPayload = {
  firstName: string
  lastName: string
  email: string
  phone: string
  schoolId: string
  schoolName: string
  courseSlug: string
  courseTitle: string
  courseKey: string
  message?: string
  registrationType?: RegistrationType
  location?: string
  hasWorkingComputer?: boolean
  canDevote6HoursWeekly?: boolean
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export function buildSiwesRegistrationPayload(input: {
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  courseSlug: string
  duration: string
  otherInfo?: string
}): CourseRegistrationPayload | { error: string } {
  const resolved = findCourseBySlug(input.courseSlug)

  if (!resolved) {
    return { error: "Select a valid course." }
  }

  const { school, course } = resolved
  const messageParts = [
    "Registration type: SIWES / Industrial Training",
    `Location: ${input.location}`,
    `Duration: ${input.duration}`,
  ]

  if (input.otherInfo) {
    messageParts.push("", input.otherInfo)
  }

  return {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    schoolId: school.id,
    schoolName: school.name,
    courseSlug: course.slug,
    courseTitle: course.title,
    courseKey: `${school.id}/${course.slug}`,
    message: messageParts.join("\n"),
    registrationType: "siwes",
  }
}

export function buildCorporateRegistrationPayload(input: {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  trainingArea: string
  participants: string
  details: string
}): CourseRegistrationPayload {
  const courseSlug = slugify(input.trainingArea) || "training-request"

  return {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    schoolId: "corporate",
    schoolName: "Corporate Training",
    courseSlug,
    courseTitle: input.trainingArea,
    courseKey: `corporate/${courseSlug}`,
    message: [
      "Registration type: Corporate Training Request",
      `Company: ${input.company}`,
      `Team size: ${input.participants}`,
      "",
      input.details,
    ].join("\n"),
    registrationType: "corporate",
  }
}

export async function submitCourseRegistration(
  payload: CourseRegistrationPayload,
  paymentReceipt?: File | null
) {
  const recaptchaToken = await getRecaptchaToken(
    recaptchaActions.courseRegistration
  )

  if (paymentReceipt) {
    const formData = new FormData()

    formData.append("firstName", payload.firstName)
    formData.append("lastName", payload.lastName)
    formData.append("email", payload.email)
    formData.append("phone", payload.phone)
    formData.append("schoolId", payload.schoolId)
    formData.append("schoolName", payload.schoolName)
    formData.append("courseSlug", payload.courseSlug)
    formData.append("courseTitle", payload.courseTitle)
    formData.append("courseKey", payload.courseKey)
    formData.append("message", payload.message ?? "")
    formData.append("registrationType", payload.registrationType ?? "course")

    if (payload.location) formData.append("location", payload.location)
    if (payload.hasWorkingComputer !== undefined) {
      formData.append(
        "hasWorkingComputer",
        payload.hasWorkingComputer ? "yes" : "no"
      )
    }
    if (payload.canDevote6HoursWeekly !== undefined) {
      formData.append(
        "canDevote6HoursWeekly",
        payload.canDevote6HoursWeekly ? "yes" : "no"
      )
    }

    if (recaptchaToken) {
      formData.append("recaptchaToken", recaptchaToken)
    }

    formData.append("paymentReceipt", paymentReceipt)

    const response = await fetch("/api/registrations", {
      method: "POST",
      body: formData,
    })

    const result = (await response.json().catch(() => null)) as {
      error?: string
    } | null

    if (!response.ok) {
      throw new Error(
        result?.error ?? "Unable to submit your registration right now."
      )
    }

    return
  }

  const response = await fetch("/api/registrations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      recaptchaToken,
    }),
  })

  const result = (await response.json().catch(() => null)) as {
    error?: string
  } | null

  if (!response.ok) {
    throw new Error(result?.error ?? "Unable to submit your registration right now.")
  }
}
