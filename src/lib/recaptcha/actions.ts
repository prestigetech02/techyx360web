export const recaptchaActions = {
  contact: "contact",
  courseRegistration: "course_registration",
  pifApplication: "pif_application",
  careerApplication: "career_application",
  talentPool: "talent_pool",
} as const


export type RecaptchaAction =
  (typeof recaptchaActions)[keyof typeof recaptchaActions]
