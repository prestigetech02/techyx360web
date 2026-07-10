import { normalizeLineItemAmount } from "@/lib/invoices/calculations"
import { asLineItemType } from "@/lib/invoices/mappers"
import type { InvoiceLineItemType } from "@/lib/invoices/types"

export type ParsedLineItem = {
  description: string
  amount: number
  type: InvoiceLineItemType
}

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export function parseLineItems(value: unknown): ParsedLineItem[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (typeof item !== "object" || item === null) return null

      const record = item as Record<string, unknown>
      const description = sanitize(record.description)
      const rawAmount = Number(record.amount)
      const type = asLineItemType(sanitize(record.type))

      if (!description || !Number.isFinite(rawAmount)) return null

      return {
        description,
        amount: normalizeLineItemAmount(type, rawAmount),
        type,
      }
    })
    .filter((item): item is ParsedLineItem => item !== null)
}
