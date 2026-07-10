import { cn } from "@/lib/utils"

export type InvoiceLineItemType = "service" | "discount" | "tax" | "adjustment"

export type InvoiceLineItem = {
  id: string
  description: string
  amount: number
  type?: InvoiceLineItemType
}

export type InvoiceTableProps = {
  lineItems: InvoiceLineItem[]
  subtotal?: number
  discountTotal?: number
  vatEnabled?: boolean
  vatRate?: number
  vatAmount?: number
  total: number
  currency?: "NGN"
  className?: string
}

function formatNaira(amount: number) {
  const formatted = new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount))

  const prefix = amount < 0 ? "-" : ""
  return `${prefix}₦${formatted}`
}

function isDiscountItem(item: InvoiceLineItem) {
  return item.type === "discount" || item.amount < 0
}

export function InvoiceTable({
  lineItems,
  subtotal,
  discountTotal = 0,
  vatEnabled = false,
  vatRate = 7.5,
  vatAmount = 0,
  total,
  currency = "NGN",
  className,
}: InvoiceTableProps) {
  const currencyLabel = currency === "NGN" ? "₦" : currency
  const showDiscount = discountTotal > 0
  const showVat = vatEnabled && vatAmount > 0
  const showSummary = showDiscount || showVat

  return (
    <section className={cn("invoice-document__table-section", className)}>
      <div className="invoice-document__table-wrap">
        <table className="invoice-document__table">
          <thead>
            <tr>
              <th scope="col">Service description</th>
              <th scope="col">Amount ({currencyLabel})</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item) => {
              const isDiscount = isDiscountItem(item)

              return (
                <tr
                  key={item.id}
                  className={cn(isDiscount && "is-discount")}
                >
                  <td>{item.description}</td>
                  <td>{formatNaira(item.amount)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            {showSummary ? (
              <>
                <tr className="is-summary">
                  <td>Subtotal</td>
                  <td>{formatNaira(subtotal ?? total)}</td>
                </tr>
                {showDiscount ? (
                  <tr className="is-summary is-discount">
                    <td>Discount</td>
                    <td>-{formatNaira(discountTotal)}</td>
                  </tr>
                ) : null}
                {showVat ? (
                  <tr className="is-summary">
                    <td>VAT ({vatRate}%)</td>
                    <td>{formatNaira(vatAmount)}</td>
                  </tr>
                ) : null}
              </>
            ) : null}
            <tr className="is-total">
              <td>Total amount payable</td>
              <td>{formatNaira(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}
