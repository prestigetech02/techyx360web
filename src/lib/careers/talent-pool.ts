import { recaptchaActions } from "@/lib/recaptcha/actions"
import { getRecaptchaToken } from "@/lib/recaptcha/client"

export async function submitTalentPoolApplication(formData: FormData) {
  const recaptchaToken = await getRecaptchaToken(recaptchaActions.talentPool)

  if (recaptchaToken) {
    formData.set("recaptchaToken", recaptchaToken)
  }

  const response = await fetch("/api/talent-pool", {
    method: "POST",
    body: formData,
  })

  const result = (await response.json().catch(() => null)) as {
    error?: string
  } | null

  if (!response.ok) {
    throw new Error(
      result?.error ?? "Unable to submit your details right now."
    )
  }
}
