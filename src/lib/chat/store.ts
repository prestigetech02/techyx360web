import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import {
  isChatConversationStatus,
  isChatMessageRole,
  type ChatConversationRecord,
  type ChatConversationStatus,
  type ChatConversationView,
  type ChatMessageRecord,
  type ChatMessageRole,
  type ChatMessageView,
} from "@/lib/chat/types"
import type { Database } from "@/types/database"

type ConversationRow = Database["public"]["Tables"]["chat_conversations"]["Row"]
type MessageRow = Database["public"]["Tables"]["chat_messages"]["Row"]

function mapConversation(row: ConversationRow): ChatConversationRecord {
  return {
    id: row.id,
    visitor_token_hash: row.visitor_token_hash,
    status: isChatConversationStatus(row.status) ? row.status : "bot",
    assignee_id: row.assignee_id,
    visitor_name: row.visitor_name,
    visitor_email: row.visitor_email,
    visitor_phone: row.visitor_phone,
    page_path: row.page_path,
    handoff_reason: row.handoff_reason,
    last_message_at: row.last_message_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

function mapMessage(row: MessageRow): ChatMessageRecord {
  return {
    id: row.id,
    conversation_id: row.conversation_id,
    role: isChatMessageRole(row.role) ? row.role : "system",
    content: row.content,
    staff_id: row.staff_id,
    created_at: row.created_at,
  }
}

export function toConversationView(
  row: ChatConversationRecord,
  preview = "",
  assigneeName: string | null = null
): ChatConversationView {
  return {
    id: row.id,
    status: row.status,
    assigneeId: row.assignee_id,
    assigneeName,
    visitorName: row.visitor_name,
    visitorEmail: row.visitor_email,
    visitorPhone: row.visitor_phone,
    pagePath: row.page_path,
    handoffReason: row.handoff_reason,
    lastMessageAt: row.last_message_at,
    createdAt: row.created_at,
    preview,
  }
}

export function toMessageView(row: ChatMessageRecord): ChatMessageView {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    role: row.role,
    content: row.content,
    staffId: row.staff_id,
    createdAt: row.created_at,
  }
}

export async function findLatestConversation(visitorTokenHash: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("visitor_token_hash", visitorTokenHash)
    .order("last_message_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data ? mapConversation(data) : null
}

export async function createConversation(input: {
  visitorTokenHash: string
  pagePath: string
}) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("chat_conversations")
    .insert({
      visitor_token_hash: input.visitorTokenHash,
      page_path: input.pagePath,
      status: "bot",
    })
    .select("*")
    .single()

  if (error) throw error
  return mapConversation(data)
}

export async function getOrCreateOpenConversation(input: {
  visitorTokenHash: string
  pagePath: string
}) {
  const existing = await findLatestConversation(input.visitorTokenHash)
  if (existing && existing.status !== "closed") {
    return existing
  }
  return createConversation(input)
}

export async function getConversationById(id: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  return data ? mapConversation(data) : null
}

export async function listConversations(status?: ChatConversationStatus) {
  const supabase = createAdminClient()
  let query = supabase
    .from("chat_conversations")
    .select("*")
    .order("last_message_at", { ascending: false })
    .limit(80)

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map(mapConversation)
}

export async function updateConversation(
  id: string,
  patch: Database["public"]["Tables"]["chat_conversations"]["Update"]
) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("chat_conversations")
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single()

  if (error) throw error
  return mapConversation(data)
}

export async function touchConversation(id: string) {
  return updateConversation(id, {
    last_message_at: new Date().toISOString(),
  })
}

export async function listMessages(conversationId: string, limit = 200) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(limit)

  if (error) throw error
  return (data ?? []).map(mapMessage)
}

export async function insertMessage(input: {
  conversationId: string
  role: ChatMessageRole
  content: string
  staffId?: string | null
}) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      conversation_id: input.conversationId,
      role: input.role,
      content: input.content,
      staff_id: input.staffId ?? null,
    })
    .select("*")
    .single()

  if (error) throw error
  await touchConversation(input.conversationId)
  return mapMessage(data)
}

export async function countRecentUserMessages(conversationId: string) {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const supabase = createAdminClient()
  const { count, error } = await supabase
    .from("chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", conversationId)
    .eq("role", "user")
    .gte("created_at", since)

  if (error) throw error
  return count ?? 0
}

export async function getLatestMessagePreviews(conversationIds: string[]) {
  if (conversationIds.length === 0) return new Map<string, string>()

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("chat_messages")
    .select("conversation_id, content, created_at")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false })
    .limit(400)

  if (error) throw error

  const previews = new Map<string, string>()
  for (const row of data ?? []) {
    if (previews.has(row.conversation_id)) continue
    previews.set(row.conversation_id, row.content)
  }
  return previews
}

export async function getAssigneeNames(assigneeIds: string[]) {
  const ids = [...new Set(assigneeIds.filter(Boolean))]
  if (ids.length === 0) return new Map<string, string>()

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("team_members")
    .select("id, full_name")
    .in("id", ids)

  if (error) throw error
  return new Map((data ?? []).map((row) => [row.id, row.full_name]))
}
