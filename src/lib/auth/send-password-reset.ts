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

export async function sendPasswordResetLink(email: string) {
  const address = email.trim().toLowerCase()
  if (!address.includes("@")) {
    throw new Error("Enter a valid email address.")
  }

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

  if (!isTransactionalEmailConfigured()) {
    throw new Error(
      "Email is not configured. Add ZEPTOMAIL_TOKEN and ZEPTOMAIL_FROM_EMAIL."
    )
  }

  const resetUrl = `${siteUrl}/auth/confirm?token_hash=${encodeURIComponent(
    data.properties.hashed_token
  )}&type=recovery&next=/admin/reset-password`

  await sendTransactionalEmail({
    to: address,
    subject: "Reset your Techyx360 password",
    html: `
      <div style="margin:0;padding:24px;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
          <div style="background:#0b2c66;padding:24px 28px;">
            <p style="margin:0;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#eaaa33;font-weight:700;">
              Techyx360
            </p>
            <h1 style="margin:8px 0 0;font-size:22px;color:#ffffff;">
              Reset your password
            </h1>
          </div>
          <div style="padding:28px;">
            <p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:#1f2937;">
              We received a request to reset the password for ${escapeHtml(address)}.
            </p>
            <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#1f2937;">
              Click the button below to choose a new password. This link expires soon and can be used once.
            </p>
            <p style="margin:0;">
              <a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background:#0b2c66;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;">
                Choose a new password
              </a>
            </p>
            <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#64748b;">
              If you did not request this, you can ignore this email.
            </p>
          </div>
        </div>
      </div>
    `,
  })
}
