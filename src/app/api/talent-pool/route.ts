import { NextResponse } from "next/server"

import {
  careerAvailabilityOptions,
  careerExperienceOptions,
} from "@/config/careers"
import { uploadCareerCv } from "@/lib/careers/cv-upload"
import { recaptchaActions } from "@/lib/recaptcha/actions"
import { requireRecaptcha } from "@/lib/recaptcha/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

const allowedExperience = new Set<string>(
  careerExperienceOptions.map((option) => option.value)
)
const allowedAvailability = new Set<string>(
  careerAvailabilityOptions.map((option) => option.value)
)

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured yet." },
      { status: 500 }
    )
  }

  try {
    const formData = await request.formData()

    const recaptchaError = await requireRecaptcha(
      { recaptchaToken: sanitize(formData.get("recaptchaToken")) },
      recaptchaActions.talentPool
    )
    if (recaptchaError) return recaptchaError

    const fullName = sanitize(formData.get("fullName"))
    const email = sanitize(formData.get("email")).toLowerCase()
    const phone = sanitize(formData.get("phone"))
    const location = sanitize(formData.get("location"))
    const linkedinUrl = sanitize(formData.get("linkedinUrl"))
    const githubUrl = sanitize(formData.get("githubUrl"))
    const portfolioUrl = sanitize(formData.get("portfolioUrl"))
    const interestAreas = sanitize(formData.get("interestAreas"))
    const yearsOfExperience = sanitize(formData.get("yearsOfExperience"))
    const expectedSalary = sanitize(formData.get("expectedSalary"))
    const message = sanitize(formData.get("message"))
    const availability = sanitize(formData.get("availability"))
    const cv = formData.get("cv")

    if (
      !fullName ||
      !email ||
      !phone ||
      !location ||
      !interestAreas ||
      !yearsOfExperience ||
      !availability
    ) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      )
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      )
    }

    if (portfolioUrl && !isValidUrl(portfolioUrl)) {
      return NextResponse.json(
        { error: "Enter a valid portfolio URL (including https://)." },
        { status: 400 }
      )
    }

    if (linkedinUrl && !isValidUrl(linkedinUrl)) {
      return NextResponse.json(
        { error: "Enter a valid LinkedIn URL (including https://)." },
        { status: 400 }
      )
    }

    if (githubUrl && !isValidUrl(githubUrl)) {
      return NextResponse.json(
        { error: "Enter a valid GitHub URL (including https://)." },
        { status: 400 }
      )
    }

    if (!allowedExperience.has(yearsOfExperience)) {
      return NextResponse.json(
        { error: "Select a valid years of experience option." },
        { status: 400 }
      )
    }

    if (!allowedAvailability.has(availability)) {
      return NextResponse.json(
        { error: "Select a valid availability option." },
        { status: 400 }
      )
    }

    if (!(cv instanceof File) || cv.size === 0) {
      return NextResponse.json(
        { error: "Please upload your CV before submitting." },
        { status: 400 }
      )
    }

    const uploadResult = await uploadCareerCv(cv, "talent-pool")
    if ("error" in uploadResult) {
      return NextResponse.json({ error: uploadResult.error }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from("talent_pool_submissions").insert({
      full_name: fullName,
      email,
      phone,
      location,
      linkedin_url: linkedinUrl || null,
      github_url: githubUrl || null,
      portfolio_url: portfolioUrl || null,
      cv_path: uploadResult.path,
      interest_areas: interestAreas,
      years_of_experience: yearsOfExperience,
      expected_salary: expectedSalary || null,
      message: message || null,
      availability,
    })

    if (error) {
      console.error("Failed to save talent pool submission", error)
      return NextResponse.json(
        { error: "Unable to save your submission right now." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected talent pool submission error", error)
    return NextResponse.json(
      { error: "Unable to process your submission right now." },
      { status: 500 }
    )
  }
}
