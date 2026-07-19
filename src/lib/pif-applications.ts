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

export async function submitPifApplication(
  payload: PifApplicationPayload,
  paymentReceipt: File
) {
  const recaptchaToken = await getRecaptchaToken(
    recaptchaActions.pifApplication
  )

  const formData = new FormData()
  formData.append("firstName", payload.firstName)
  formData.append("lastName", payload.lastName)
  formData.append("email", payload.email)
  formData.append("phone", payload.phone)
  formData.append("educationExperience", payload.educationExperience)
  formData.append("preferredTrack", payload.preferredTrack)
  formData.append("portfolioUrl", payload.portfolioUrl ?? "")
  formData.append("motivation", payload.motivation)
  formData.append("goals", payload.goals)
  formData.append(
    "programCommitmentAgreed",
    payload.programCommitmentAgreed ? "true" : "false"
  )
  formData.append("paymentReceipt", paymentReceipt)

  if (recaptchaToken) {
    formData.append("recaptchaToken", recaptchaToken)
  }

  const response = await fetch("/api/pif-applications", {
    method: "POST",
    body: formData,
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
