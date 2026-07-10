"use client"

import { useState } from "react"
import { Download, Mail, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { notify } from "@/lib/toast"

type InvoiceActionsProps = {
  invoiceId: string
  invoiceNumber: string
  clientEmail?: string | null
  emailConfigured?: boolean
}

export function InvoiceActions({
  invoiceId,
  invoiceNumber,
  clientEmail,
  emailConfigured = false,
}: InvoiceActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isEmailOpen, setIsEmailOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [recipient, setRecipient] = useState(clientEmail ?? "")
  const [message, setMessage] = useState("")

  async function handleDownloadPdf() {
    setIsDownloading(true)

    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}/pdf`)

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(data?.error ?? "Unable to download PDF.")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${invoiceNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      notify.success("Invoice PDF downloaded.")
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "Unable to download PDF."
      )
    } finally {
      setIsDownloading(false)
    }
  }

  async function handleSendEmail() {
    if (!recipient.trim() || !recipient.includes("@")) {
      notify.error("Enter a valid recipient email address.")
      return
    }

    setIsSending(true)

    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipient.trim(),
          message: message.trim(),
        }),
      })

      const data = (await response.json().catch(() => null)) as {
        error?: string
      } | null

      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to send invoice email.")
      }

      notify.success(`Invoice emailed to ${recipient.trim()}.`)
      setIsEmailOpen(false)
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "Unable to send invoice email."
      )
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          className="h-11 gap-2 rounded-xl px-5"
          onClick={() => window.print()}
        >
          <Printer className="size-4" aria-hidden />
          Print
        </Button>

        <Button
          variant="outline"
          className="h-11 gap-2 rounded-xl px-5"
          disabled={isDownloading}
          onClick={() => void handleDownloadPdf()}
        >
          <Download className="size-4" aria-hidden />
          {isDownloading ? "Generating…" : "Download PDF"}
        </Button>

        <Button
          className="h-11 gap-2 rounded-xl bg-brand px-5 text-brand-foreground hover:bg-brand/90"
          disabled={!emailConfigured}
          onClick={() => setIsEmailOpen(true)}
        >
          <Mail className="size-4" aria-hidden />
          Email invoice
        </Button>
      </div>

      <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Email invoice</DialogTitle>
            <DialogDescription>
              Send {invoiceNumber} as a PDF attachment to your client.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="invoice-email-recipient"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Recipient email
              </label>
              <Input
                id="invoice-email-recipient"
                type="email"
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
                placeholder="client@example.com"
                className="h-11 rounded-xl"
              />
            </div>

            <div>
              <label
                htmlFor="invoice-email-message"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Message{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>
              <textarea
                id="invoice-email-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                placeholder={`Please find attached invoice ${invoiceNumber}.`}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>

            {!emailConfigured ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                Add `RESEND_API_KEY` and `INVOICE_FROM_EMAIL` to enable email
                delivery.
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={isSending || !emailConfigured}
              onClick={() => void handleSendEmail()}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {isSending ? "Sending…" : "Send email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
