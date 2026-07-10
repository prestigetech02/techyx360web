import { cn } from "@/lib/utils"

export type SignatureProps = {
  name?: string
  title: string
  signatureText?: string
  align?: "left" | "right"
  className?: string
}

export function Signature({
  name,
  title,
  signatureText,
  align = "right",
  className,
}: SignatureProps) {
  const hasSignature = Boolean(name || signatureText)

  return (
    <section
      className={cn(
        "invoice-document__signature",
        align === "left" && "text-left",
        className
      )}
    >
      {hasSignature ? (
        <>
          <div className="invoice-document__signature-line">
            {signatureText ?? name}
          </div>
          <p className="invoice-document__signature-title">{title}</p>
        </>
      ) : (
        <>
          <div className="invoice-document__signature-placeholder" />
          <p className="invoice-document__signature-title">{title}</p>
        </>
      )}
    </section>
  )
}
