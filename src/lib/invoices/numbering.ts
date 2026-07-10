/**
 * Invoice number format: INV{YYYY}{ClientCode}{Sequence}
 * e.g. INV2026CI11
 */
export function getClientCode(clientName: string) {
  const words = clientName
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (words.length === 0) return "XX"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()

  return (words[0][0] + words[1][0]).toUpperCase()
}

export function generateInvoiceNumber({
  clientName,
  sequence,
  year = new Date().getFullYear(),
}: {
  clientName: string
  sequence: number
  year?: number
}) {
  return `INV${year}${getClientCode(clientName)}${sequence}`
}
