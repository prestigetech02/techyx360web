import "server-only"

import { NextResponse } from "next/server"

import {
  findLatestConversation,
  getOrCreateOpenConversation,
} from "@/lib/chat/store"
import { sanitizePagePath } from "@/lib/chat/message-utils"
import {
  hashVisitorToken,
  visitorTokenFromRequest,
} from "@/lib/chat/visitor-token"

export function invalidVisitorResponse() {
  return NextResponse.json(
    { error: "Missing chat session. Refresh the page and try again." },
    { status: 400 }
  )
}

export async function resolveVisitorConversation(
  request: Request,
  body: Record<string, unknown>,
  options?: { createIfMissing?: boolean }
) {
  const token = visitorTokenFromRequest(request)
  if (!token) {
    return {
      ok: false as const,
      response: invalidVisitorResponse(),
    }
  }

  const visitorTokenHash = hashVisitorToken(token)
  const pagePath = sanitizePagePath(body.pagePath ?? body.page_path)
  const createIfMissing = options?.createIfMissing ?? false

  const conversation = createIfMissing
    ? await getOrCreateOpenConversation({ visitorTokenHash, pagePath })
    : await findLatestConversation(visitorTokenHash)

  return {
    ok: true as const,
    conversation,
    visitorTokenHash,
    pagePath,
  }
}
