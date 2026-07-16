/**
 * NGN amount helpers: thousand separators + kobo (2 decimal places).
 */

export function formatAmountInput(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "")
  if (!cleaned) return ""

  const hasDecimal = cleaned.includes(".")
  const [integerRaw = "", ...decimalParts] = cleaned.split(".")
  const decimalRaw = decimalParts.join("").slice(0, 2)
  const integerDigits = integerRaw.replace(/^0+(?=\d)/, "") || (hasDecimal ? "0" : integerRaw)

  const withCommas = integerDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ",")

  if (hasDecimal) {
    return `${withCommas}.${decimalRaw}`
  }

  return withCommas
}

export function parseAmountInput(value: string): number | null {
  const cleaned = value.replace(/,/g, "").trim()
  if (!cleaned || cleaned === ".") return null

  const amount = Number(cleaned)
  if (!Number.isFinite(amount)) return null

  return Math.round(amount * 100) / 100
}

export function formatAmountFromNumber(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
