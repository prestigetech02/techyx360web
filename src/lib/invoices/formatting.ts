export function formatNaira(amount: number) {
  const formatted = new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount))

  return `${amount < 0 ? "-" : ""}₦${formatted}`
}

/** e.g. "04 March, 2026" — matches the PDF layout. */
export function formatInvoiceDate(isoDate: string) {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return isoDate

  const day = String(date.getDate()).padStart(2, "0")
  const month = date.toLocaleDateString("en-GB", { month: "long" })
  return `${day} ${month}, ${date.getFullYear()}`
}

/** Split a free-text address into display lines. */
export function splitAddressLines(address: string | null | undefined) {
  if (!address) return []
  return address
    .split(/\r?\n|,\s*(?=[A-Z])/)
    .map((line) => line.trim())
    .filter(Boolean)
}
