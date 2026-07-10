type LineItemLike = {
  amount: number
  type?: string
}

export type InvoiceTotalsOptions = {
  vatEnabled?: boolean
  vatRate?: number
}

export type InvoiceTotals = {
  subtotal: number
  discountTotal: number
  taxableAmount: number
  vatEnabled: boolean
  vatRate: number
  vatAmount: number
  total: number
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100
}

/**
 * Subtotal = positive (non-discount) amounts.
 * Discount total = absolute value of negative/discount amounts.
 * Taxable amount = subtotal - discount.
 * VAT (optional) = taxable amount × rate.
 * Total = taxable amount + VAT.
 */
export function calculateInvoiceTotals(
  items: LineItemLike[],
  options: InvoiceTotalsOptions = {}
): InvoiceTotals {
  let subtotal = 0
  let discountTotal = 0

  for (const item of items) {
    const amount = Number.isFinite(item.amount) ? item.amount : 0
    const isDiscount = item.type === "discount" || amount < 0

    if (isDiscount) {
      discountTotal += Math.abs(amount)
    } else {
      subtotal += amount
    }
  }

  const roundedSubtotal = roundMoney(subtotal)
  const roundedDiscount = roundMoney(discountTotal)
  const taxableAmount = roundMoney(Math.max(roundedSubtotal - roundedDiscount, 0))
  const vatEnabled = Boolean(options.vatEnabled)
  const vatRate = Number.isFinite(options.vatRate) ? Number(options.vatRate) : 7.5
  const vatAmount = vatEnabled
    ? roundMoney(taxableAmount * (vatRate / 100))
    : 0

  return {
    subtotal: roundedSubtotal,
    discountTotal: roundedDiscount,
    taxableAmount,
    vatEnabled,
    vatRate,
    vatAmount,
    total: roundMoney(taxableAmount + vatAmount),
  }
}

/** Discounts are always stored as negative amounts. */
export function normalizeLineItemAmount(type: string, amount: number) {
  const absolute = Math.abs(Number.isFinite(amount) ? amount : 0)
  return type === "discount" ? -absolute : absolute
}
