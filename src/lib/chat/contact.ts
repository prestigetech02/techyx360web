import type { ChatConversationRecord } from "@/lib/chat/types"

export function missingLeadFields(conversation: {
  visitor_name: string
  visitor_email: string
  visitor_phone: string
}) {
  const missing: string[] = []
  const name = conversation.visitor_name.trim()
  if (!name || name.split(/\s+/).length < 2) {
    missing.push("full name")
  }
  const email = conversation.visitor_email.trim()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    missing.push("email")
  }
  const phoneDigits = conversation.visitor_phone.replace(/\D/g, "")
  if (phoneDigits.length < 7) {
    missing.push("phone number")
  }
  return missing
}

export function hasLeadContact(conversation: {
  visitor_name: string
  visitor_email: string
  visitor_phone: string
}) {
  return missingLeadFields(conversation).length === 0
}

export function applyContactPatch(
  conversation: Pick<
    ChatConversationRecord,
    "visitor_name" | "visitor_email" | "visitor_phone"
  >,
  input: { name?: string; email?: string; phone?: string }
) {
  return {
    visitor_name: input.name?.trim()
      ? input.name.trim().slice(0, 120)
      : conversation.visitor_name,
    visitor_email: input.email?.trim()
      ? input.email.trim().slice(0, 200)
      : conversation.visitor_email,
    visitor_phone: input.phone?.trim()
      ? input.phone.trim().slice(0, 40)
      : conversation.visitor_phone,
  }
}
