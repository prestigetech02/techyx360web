import "server-only"

import { siteUrl } from "@/config/site"
import {
  isTransactionalEmailConfigured,
  sendTransactionalEmail,
} from "@/lib/email/zeptomail"
import { createAdminClient } from "@/lib/supabase/admin"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function requireZeptoMail() {
  if (!isTransactionalEmailConfigured()) {
    throw new Error(
      "Email is not configured. Add ZEPTOMAIL_TOKEN and ZEPTOMAIL_FROM_EMAIL."
    )
  }
}

function authEmailHtml({
  title,
  intro,
  detail,
  buttonLabel,
  url,
  footer,
}: {
  title: string
  intro: string
  detail: string
  buttonLabel: string
  url: string
  footer: string
}) {
  return `
    <div style="margin:0;padding:24px;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
        <div style="background:#0b2c66;padding:24px 28px;">
          <p style="margin:0;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#eaaa33;font-weight:700;">
            Techyx360
          </p>
          <h1 style="margin:8px 0 0;font-size:22px;color:#ffffff;">
            ${escapeHtml(title)}
          </h1>
        </div>
        <div style="padding:28px;">
          <p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:#1f2937;">
            ${intro}
          </p>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#1f2937;">
            ${detail}
          </p>
          <p style="margin:0;">
            <a href="${url}" style="display:inline-block;padding:12px 20px;background:#0b2c66;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;">
              ${escapeHtml(buttonLabel)}
            </a>
          </p>
          <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#64748b;">
            ${escapeHtml(footer)}
          </p>
        </div>
      </div>
    </div>
  `
}

export class StaffAuthEmailError extends Error {
  alreadyRegistered = false

  constructor(message: string, alreadyRegistered = false) {
    super(message)
    this.alreadyRegistered = alreadyRegistered
  }
}

export async function sendPasswordResetLink(email: string) {
  const address = email.trim().toLowerCase()
  if (!address.includes("@")) {
    throw new Error("Enter a valid email address.")
  }

  requireZeptoMail()

  const supabase = createAdminClient()
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email: address,
    options: {
      redirectTo: `${siteUrl}/admin/reset-password`,
    },
  })

  if (error || !data.properties?.hashed_token) {
    if (error && /unable to find user|user not found/i.test(error.message)) {
      return
    }
    throw new Error(error?.message || "Unable to create a password reset link.")
  }

  const resetUrl = `${siteUrl}/auth/confirm?token_hash=${encodeURIComponent(
    data.properties.hashed_token
  )}&type=recovery&next=/admin/reset-password`

  await sendTransactionalEmail({
    to: address,
    subject: "Reset your Techyx360 password",
    html: authEmailHtml({
      title: "Reset your password",
      intro: `We received a request to reset the password for ${escapeHtml(address)}.`,
      detail:
        "Click the button below to choose a new password. This link expires soon and can be used once.",
      buttonLabel: "Choose a new password",
      url: resetUrl,
      footer: "If you did not request this, you can ignore this email.",
    }),
  })
}

export async function sendStaffInviteLink({
  email,
  fullName,
  memberId,
}: {
  email: string
  fullName: string
  memberId: string
}) {
  const address = email.trim().toLowerCase()
  if (!address.includes("@")) {
    throw new StaffAuthEmailError("This member needs a valid email before they can log in.")
  }

  requireZeptoMail()

  const supabase = createAdminClient()
  let hashedToken = ""
  let linkType: "invite" | "recovery" = "invite"

  const invite = await supabase.auth.admin.generateLink({
    type: "invite",
    email: address,
    options: {
      redirectTo: `${siteUrl}/admin/accept-invite`,
      data: {
        full_name: fullName,
        team_member_id: memberId,
      },
    },
  })

  if (invite.data?.properties?.hashed_token) {
    hashedToken = invite.data.properties.hashed_token
  } else {
    const alreadyRegistered = /already been registered|already registered/i.test(
      invite.error?.message ?? ""
    )
    if (!alreadyRegistered) {
      throw new StaffAuthEmailError(
        invite.error?.message || "Unable to send login invite."
      )
    }

    const recovery = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: address,
      options: {
        redirectTo: `${siteUrl}/admin/accept-invite`,
      },
    })

    if (recovery.error || !recovery.data.properties?.hashed_token) {
      throw new StaffAuthEmailError(
        `${address} already has a login. Ask them to use Forgot password on /admin/login.`,
        true
      )
    }

    hashedToken = recovery.data.properties.hashed_token
    linkType = "recovery"
  }

  const firstName = fullName.trim().split(/\s+/)[0] || "there"
  const inviteUrl = `${siteUrl}/auth/confirm?token_hash=${encodeURIComponent(
    hashedToken
  )}&type=${linkType}&next=/admin/accept-invite`

  await sendTransactionalEmail({
    to: address,
    toName: fullName,
    subject: "Set your Techyx360 staff password",
    html: authEmailHtml({
      title: "Set your password",
      intro: `Hi ${escapeHtml(firstName)}, you have been invited to the Techyx360 staff workspace.`,
      detail:
        "Click the button below to create your password and sign in. This link expires soon and can be used once.",
      buttonLabel: "Set your password",
      url: inviteUrl,
      footer: "If you were not expecting this invite, you can ignore this email.",
    }),
  })
}
