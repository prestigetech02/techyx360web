export function parseCareerSalaryInput(value: unknown): number | null | undefined {
  if (value == null || value === "") return null

  if (typeof value === "number") {
    if (!Number.isFinite(value) || value < 0) return undefined
    return Math.round(value)
  }

  if (typeof value === "string") {
    const normalized = value.trim().replace(/,/g, "")
    if (!normalized) return null
    const amount = Number(normalized)
    if (!Number.isFinite(amount) || amount < 0) return undefined
    return Math.round(amount)
  }

  return undefined
}

export function normalizeCareerSalaryValue(
  value: unknown
): number | null {
  const parsed = parseCareerSalaryInput(value)
  if (parsed === undefined) return null
  return parsed
}
