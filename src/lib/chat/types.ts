export const CHAT_VISITOR_HEADER = "x-visitor-token"
export const CHAT_MAX_MESSAGE_LENGTH = 2000
export const CHAT_MAX_USER_MESSAGES_PER_HOUR = 40
export const OFFER_HUMAN_HANDOFF = "OFFER_HUMAN_HANDOFF"

export const chatConversationStatuses = [
  "bot",
  "waiting",
  "human",
  "closed",
] as const

export type ChatConversationStatus = (typeof chatConversationStatuses)[number]

export const chatMessageRoles = ["user", "assistant", "staff", "system"] as const

export type ChatMessageRole = (typeof chatMessageRoles)[number]

export type ChatConversationRecord = {
  id: string
  visitor_token_hash: string
  status: ChatConversationStatus
  assignee_id: string | null
  visitor_name: string
  visitor_email: string
  visitor_phone: string
  page_path: string
  handoff_reason: string
  last_message_at: string
  created_at: string
  updated_at: string
}

export type ChatMessageRecord = {
  id: string
  conversation_id: string
  role: ChatMessageRole
  content: string
  staff_id: string | null
  created_at: string
}

export type ChatConversationView = {
  id: string
  status: ChatConversationStatus
  assigneeId: string | null
  assigneeName: string | null
  visitorName: string
  visitorEmail: string
  visitorPhone: string
  pagePath: string
  handoffReason: string
  lastMessageAt: string
  createdAt: string
  preview: string
}

export type ChatMessageView = {
  id: string
  conversationId: string
  role: ChatMessageRole
  content: string
  staffId: string | null
  createdAt: string
}

export function isChatConversationStatus(
  value: string
): value is ChatConversationStatus {
  return (chatConversationStatuses as readonly string[]).includes(value)
}

export function isChatMessageRole(value: string): value is ChatMessageRole {
  return (chatMessageRoles as readonly string[]).includes(value)
}
