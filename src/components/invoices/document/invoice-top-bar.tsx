import { cn } from "@/lib/utils"

export function InvoiceTopBar({ className }: { className?: string }) {
  return (
    <div className={cn("invoice-document__top-bar", className)} aria-hidden>
      <div className="invoice-document__top-bar-navy" />
      <div className="invoice-document__top-bar-accent" />
    </div>
  )
}
