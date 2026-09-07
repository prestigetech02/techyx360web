import "server-only"

import { organization } from "@/config/site"

const DEFAULT_API_URL = "https://api.zeptomail.com/v1.1/email"

type ZeptoMailErrorBody = {
  error?: {
    code?: string
    message?: string
    details?: Array<{ message?: string }>
  }
  message?: string
}

export type TransactionalAttachment = {
  name: string
  mimeType: string
  content: Buffer | Uint8Array
}

export type SendTransactionalEmailInput = {
  to: string
  toName?: string
  subject: string
  html: string
  attachments?: TransactionalAttachment[]
}

function getToken() {
  return (
    process.env.ZEPTOMAIL_TOKEN?.trim() ||
    process.env.ZEPTOMAIL_SEND_MAIL_TOKEN?.trim() ||
    ""
  )
}

function getAuthorizationHeader() {
  const token = getToken()
  if (!token) return null
  if (/^zoho-enczapikey\s+/i.test(token)) return token
  return `Zoho-enczapikey ${token}`
}

function getApiUrl() {
  return process.env.ZEPTOMAIL_API_URL?.trim() || DEFAULT_API_URL
}

export function getFromEmail() {
  return (
    process.env.ZEPTOMAIL_FROM_EMAIL?.trim() ||
    process.env.INVOICE_FROM_EMAIL?.trim() ||
    organization.email
  )
}

export function getFromName() {
  return process.env.ZEPTOMAIL_FROM_NAME?.trim() || organization.alternateName
}

export function isTransactionalEmailConfigured() {
  return Boolean(getToken() && getFromEmail().includes("@"))
}

function parseErrorMessage(status: number, body: ZeptoMailErrorBody) {
  const detail = body.error?.details?.find((item) => item.message)?.message
  return (
    detail ||
    body.error?.message ||
    body.message ||
    `ZeptoMail request failed (${status}).`
  )
}

export async function sendTransactionalEmail({
  to,
  toName,
  subject,
  html,
  attachments,
}: SendTransactionalEmailInput) {
  const authorization = getAuthorizationHeader()
  if (!authorization) {
    throw new Error(
      "Email is not configured. Add ZEPTOMAIL_TOKEN to your environment variables."
    )
  }

  const payload: Record<string, unknown> = {
    from: {
      address: getFromEmail(),
      name: getFromName(),
    },
    to: [
      {
        email_address: {
          address: to,
          name: toName || to,
        },
      },
    ],
    subject,
    htmlbody: html,
  }

  if (attachments && attachments.length > 0) {
    payload.attachments = attachments.map((file) => ({
      name: file.name,
      mime_type: file.mimeType,
      content: Buffer.from(file.content).toString("base64"),
    }))
  }

  const response = await fetch(getApiUrl(), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: authorization,
    },
    body: JSON.stringify(payload),
  })

  const body = (await response.json().catch(() => ({}))) as ZeptoMailErrorBody

  if (!response.ok) {
    throw new Error(parseErrorMessage(response.status, body))
  }
}
