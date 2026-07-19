import { NextResponse } from "next/server"

import { pifLearningTracks } from "@/config/product-innovation-fellowship"
import { recaptchaActions } from "@/lib/recaptcha/actions"
import { requireRecaptcha } from "@/lib/recaptcha/server"
import { uploadRegistrationReceipt } from "@/lib/registrations/receipt-upload"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

const allowedTracks = new Set<string>(pifLearningTracks)

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

type PifApplicationRequestBody = Record<string, unknown> & {
  paymentReceipt?: File
}

async function parsePifApplicationRequest(
  request: Request
): Promise<PifApplicationRequestBody> {
  const contentType = request.headers.get("content-type") ?? ""

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData()
    const body: PifApplicationRequestBody = {}

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

  return (await request.json()) as PifApplicationRequestBody
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured yet." },
      { status: 500 }
    )
  }

  try {
    const body = await parsePifApplicationRequest(request)

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
    const programCommitmentAgreed =
      body.programCommitmentAgreed === true ||
      sanitize(body.programCommitmentAgreed).toLowerCase() === "true"
    const paymentReceipt = body.paymentReceipt

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

    if (!(paymentReceipt instanceof File) || paymentReceipt.size === 0) {
      return NextResponse.json(
        { error: "Please upload your payment receipt before submitting." },
        { status: 400 }
      )
    }

    const uploadResult = await uploadRegistrationReceipt(
      paymentReceipt,
      "pif"
    )

    if ("error" in uploadResult) {
      return NextResponse.json({ error: uploadResult.error }, { status: 400 })
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
      payment_receipt_path: uploadResult.path,
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
