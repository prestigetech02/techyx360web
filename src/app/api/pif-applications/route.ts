import { NextResponse } from "next/server"

import { pifLearningTracks } from "@/config/product-innovation-fellowship"
import { recaptchaActions } from "@/lib/recaptcha/actions"
import { requireRecaptcha } from "@/lib/recaptcha/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

const allowedTracks = new Set<string>(pifLearningTracks)

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
      recaptchaActions.pifApplication
    )
    if (recaptchaError) return recaptchaError

    const firstName = sanitize(body.firstName)
    const lastName = sanitize(body.lastName)
    const email = sanitize(body.email).toLowerCase()
    const phone = sanitize(body.phone)
    const educationExperience = sanitize(body.educationExperience)
    const preferredTrack = sanitize(body.preferredTrack)
    const portfolioUrl = sanitize(body.portfolioUrl)
    const motivation = sanitize(body.motivation)
    const goals = sanitize(body.goals)
    const programCommitmentAgreed = body.programCommitmentAgreed === true

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !educationExperience ||
      !preferredTrack ||
      !motivation ||
      !goals
    ) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      )
    }

    if (!programCommitmentAgreed) {
      return NextResponse.json(
        { error: "You must agree to the program commitment to apply." },
        { status: 400 }
      )
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      )
    }

    if (!allowedTracks.has(preferredTrack)) {
      return NextResponse.json(
        { error: "Select a valid preferred track." },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from("pif_applications").insert({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      education_experience: educationExperience,
      preferred_track: preferredTrack,
      portfolio_url: portfolioUrl || null,
      motivation,
      goals,
      program_commitment_agreed: programCommitmentAgreed,
    })

    if (error) {
      console.error("Failed to save PIF application", error)
      return NextResponse.json(
        { error: "Unable to save your application right now." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected PIF application error", error)
    return NextResponse.json(
      { error: "Unable to process your application right now." },
      { status: 500 }
    )
  }
}
