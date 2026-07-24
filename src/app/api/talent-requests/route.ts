import { NextResponse } from "next/server"

import { recaptchaActions } from "@/lib/recaptcha/actions"
import { requireRecaptcha } from "@/lib/recaptcha/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

const ALLOWED_ROLES = new Set([
  "Frontend Developer",
  "Backend Developer",
  "Full-Stack Developer",
  "Mobile Developer",
  "UI/UX Designer",
  "Product Manager",
  "QA Engineer",
  "DevOps Engineer",
  "Other",
])

const ALLOWED_ENGAGEMENTS = new Set([
  "Full-time dedicated",
  "Part-time",
  "Project-based",
  "Contract / temporary",
])

const ALLOWED_DURATIONS = new Set([
  "1–3 months",
  "3–6 months",
  "6–12 months",
  "Ongoing",
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

    const recaptchaError = await requireRecaptcha(
      body,
      recaptchaActions.talentRequest
    )
    if (recaptchaError) return recaptchaError

    const firstName = sanitize(body.firstName)
    const lastName = sanitize(body.lastName)
    const email = sanitize(body.email).toLowerCase()
    const phone = sanitize(body.phone)
    const company = sanitize(body.company)
    const roleNeeded = sanitize(body.roleNeeded)
    const engagementType = sanitize(body.engagementType)
    const duration = sanitize(body.duration)
    const details = sanitize(body.details)
    const headcountRaw = body.headcount
    const headcount =
      typeof headcountRaw === "number"
        ? headcountRaw
        : Number.parseInt(sanitize(headcountRaw), 10)

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !company ||
      !roleNeeded ||
      !engagementType ||
      !duration ||
      !details
    ) {
      return NextResponse.json(
        { error: "All talent request fields are required." },
        { status: 400 }
      )
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      )
    }

    if (!ALLOWED_ROLES.has(roleNeeded)) {
      return NextResponse.json(
        { error: "Select a valid role." },
        { status: 400 }
      )
    }

    if (!ALLOWED_ENGAGEMENTS.has(engagementType)) {
      return NextResponse.json(
        { error: "Select a valid engagement type." },
        { status: 400 }
      )
    }

    if (!ALLOWED_DURATIONS.has(duration)) {
      return NextResponse.json(
        { error: "Select a valid duration." },
        { status: 400 }
      )
    }

    if (!Number.isFinite(headcount) || headcount < 1) {
      return NextResponse.json(
        { error: "Enter a valid number of people." },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from("talent_requests").insert({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      company,
      role_needed: roleNeeded,
      engagement_type: engagementType,
      headcount,
      duration,
      details,
      status: "new",
    })

    if (error) {
      console.error("Failed to save talent request", error)
      return NextResponse.json(
        { error: "Unable to save your request right now." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected talent request error", error)
    return NextResponse.json(
      { error: "Unable to process your request right now." },
      { status: 500 }
    )
  }
}
