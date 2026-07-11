export const recaptchaActions = {
  contact: "contact",
  courseRegistration: "course_registration",
  pifApplication: "pif_application",
} as const

export type RecaptchaAction =
  (typeof recaptchaActions)[keyof typeof recaptchaActions]
