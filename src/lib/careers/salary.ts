import { parseAmountInput } from "@/lib/money"

export function parseCareerSalaryInput(
  value: unknown
): number | null | undefined {
  if (value == null || value === "") return null

  if (typeof value === "number") {
    if (!Number.isFinite(value) || value < 0) return undefined
    return Math.round(value * 100) / 100
  }

  if (typeof value === "string") {
    const amount = parseAmountInput(value)
    if (amount == null) {
      return value.trim() ? undefined : null
    }
    if (amount < 0) return undefined
    return amount
  }

  return undefined
}

export function normalizeCareerSalaryValue(value: unknown): number | null {
  const parsed = parseCareerSalaryInput(value)
  if (parsed === undefined) return null
  return parsed
}
