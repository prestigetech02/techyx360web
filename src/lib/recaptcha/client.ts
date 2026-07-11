import type { RecaptchaAction } from "@/lib/recaptcha/actions"
import { getRecaptchaSiteKey, isRecaptchaClientConfigured } from "@/lib/recaptcha/config"

let scriptPromise: Promise<void> | null = null

function loadRecaptchaScript(siteKey: string) {
  if (typeof window === "undefined") {
    return Promise.resolve()
  }

  if (window.grecaptcha?.execute) {
    return Promise.resolve()
  }

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[data-recaptcha-v3="true"]'
      )

      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true })
        existing.addEventListener(
          "error",
          () => reject(new Error("Failed to load reCAPTCHA.")),
          { once: true }
        )
        return
      }

      const script = document.createElement("script")
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
      script.async = true
      script.defer = true
      script.dataset.recaptchaV3 = "true"
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("Failed to load reCAPTCHA."))
      document.head.appendChild(script)
    })
  }

  return scriptPromise
}

export async function getRecaptchaToken(action: RecaptchaAction) {
  if (!isRecaptchaClientConfigured()) {
    return undefined
  }

  const siteKey = getRecaptchaSiteKey()
  if (!siteKey) {
    return undefined
  }

  await loadRecaptchaScript(siteKey)

  if (!window.grecaptcha?.execute) {
    throw new Error("reCAPTCHA is not ready. Please try again.")
  }

  return new Promise<string>((resolve, reject) => {
    window.grecaptcha?.ready(() => {
      window.grecaptcha
        ?.execute(siteKey, { action })
        .then(resolve)
        .catch(() => reject(new Error("Unable to verify reCAPTCHA. Please try again.")))
    })
  })
}
