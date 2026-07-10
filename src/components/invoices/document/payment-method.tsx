import { cn } from "@/lib/utils"

export type PaymentMethodDetails = {
  bankName: string
  accountNumber: string
  accountName: string
}

export type PaymentMethodProps = {
  payment: PaymentMethodDetails
  title?: string
  bankNameLabel?: string
  accountNumberLabel?: string
  accountNameLabel?: string
  className?: string
}

export function PaymentMethod({
  payment,
  title = "Payment method",
  bankNameLabel = "Bank name",
  accountNumberLabel = "Bank account",
  accountNameLabel = "Acct name",
  className,
}: PaymentMethodProps) {
  const rows = [
    { label: bankNameLabel, value: payment.bankName },
    {
      label: accountNumberLabel,
      value: payment.accountNumber,
      mono: true,
    },
    { label: accountNameLabel, value: payment.accountName },
  ].filter((row) => row.value)

  return (
    <section className={cn("invoice-document__payment-method", className)}>
      <p className="invoice-document__payment-title">{title}</p>

      <dl className="invoice-document__payment-rows">
        {rows.map((row) => (
          <div key={row.label} className="invoice-document__payment-row">
            <dt>{row.label}:</dt>
            <dd className={cn(row.mono && "is-mono")}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
