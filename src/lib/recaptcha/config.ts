export function getRecaptchaSiteKey() {
  return process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() || null
}

export function isRecaptchaClientConfigured() {
  return Boolean(getRecaptchaSiteKey())
}
