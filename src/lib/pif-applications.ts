import { recaptchaActions } from "@/lib/recaptcha/actions"
import { getRecaptchaToken } from "@/lib/recaptcha/client"

export type PifApplicationPayload = {
  firstName: string
  lastName: string
  email: string
  phone: string
  educationExperience: string
  preferredTrack: string
  portfolioUrl?: string
  motivation: string
  goals: string
  programCommitmentAgreed: boolean
}

export async function submitPifApplication(payload: PifApplicationPayload) {
  const recaptchaToken = await getRecaptchaToken(
    recaptchaActions.pifApplication
  )

  const response = await fetch("/api/pif-applications", {
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
    throw new Error(
      result?.error ?? "Unable to submit your application right now."
    )
  }
}
