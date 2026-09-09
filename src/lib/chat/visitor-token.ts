import { createHash } from "crypto"

import { CHAT_VISITOR_HEADER } from "@/lib/chat/types"

const TOKEN_PATTERN = /^[a-f0-9]{32,128}$/i

export function hashVisitorToken(token: string) {
  return createHash("sha256").update(token.trim()).digest("hex")
}

export function parseVisitorToken(value: string | null) {
  const token = value?.trim() ?? ""
  if (!TOKEN_PATTERN.test(token)) return ""
  return token
}

export function visitorTokenFromRequest(request: Request) {
  return parseVisitorToken(request.headers.get(CHAT_VISITOR_HEADER))
}
