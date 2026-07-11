import "server-only"

import { NextResponse } from "next/server"

import type { RecaptchaAction } from "@/lib/recaptcha/actions"

type VerifyResponse = {
  success: boolean
  score?: number
  action?: string
  challenge_ts?: string
  hostname?: string
  "error-codes"?: string[]
}

function getRecaptchaSecretKey() {
  return process.env.RECAPTCHA_SECRET_KEY?.trim() || null
}

export function isRecaptchaServerConfigured() {
  return Boolean(
    getRecaptchaSecretKey() && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim()
  )
}

function getMinScore() {
  const configured = Number(process.env.RECAPTCHA_MIN_SCORE)
  if (Number.isFinite(configured) && configured >= 0 && configured <= 1) {
    return configured
  }
  return 0.5
}

export async function verifyRecaptchaToken(
  token: unknown,
  expectedAction?: RecaptchaAction
) {
  if (!isRecaptchaServerConfigured()) {
    return { ok: true as const }
  }

  const sanitizedToken = typeof token === "string" ? token.trim() : ""

  if (!sanitizedToken) {
    return {
      ok: false as const,
      error: "Security verification failed. Please refresh and try again.",
      status: 400,
    }
  }

  const secretKey = getRecaptchaSecretKey()
  if (!secretKey) {
    return { ok: true as const }
  }

  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: sanitizedToken,
        }),
        cache: "no-store",
      }
    )

    const result = (await response.json()) as VerifyResponse

    if (!result.success) {
      console.error("reCAPTCHA verification failed", result["error-codes"])
      return {
        ok: false as const,
        error: "Security verification failed. Please try again.",
        status: 403,
      }
    }

    if (expectedAction && result.action !== expectedAction) {
      return {
        ok: false as const,
        error: "Security verification failed. Please try again.",
        status: 403,
      }
    }

    const score = result.score ?? 0
    const minScore = getMinScore()

    if (score < minScore) {
      return {
        ok: false as const,
        error:
          "Your submission could not be verified. Please try again later.",
        status: 403,
      }
    }

    return { ok: true as const }
  } catch (error) {
    console.error("Unexpected reCAPTCHA verification error", error)
    return {
      ok: false as const,
      error: "Unable to verify your submission right now.",
      status: 500,
    }
  }
}

export async function requireRecaptcha(
  body: Record<string, unknown>,
  expectedAction: RecaptchaAction
) {
  const result = await verifyRecaptchaToken(body.recaptchaToken, expectedAction)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return null
}
