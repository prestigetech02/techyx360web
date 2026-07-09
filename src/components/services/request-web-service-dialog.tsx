"use client"

import Link from "next/link"
import {
  FormEvent,
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react"

import { Button } from "@/components/ui/button"
import { BrandCtaButton } from "@/components/ui/brand-cta-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const fieldClassName =
  "h-11 w-full rounded-xl border-border bg-background px-3.5 text-sm md:text-sm"
const labelClassName = "mb-2 block text-sm font-medium text-foreground"

type RequestWebServiceDialogContextValue = {
  openDialog: () => void
}

const RequestWebServiceDialogContext =
  createContext<RequestWebServiceDialogContextValue | null>(null)

function useRequestWebServiceDialog() {
  const context = useContext(RequestWebServiceDialogContext)
  if (!context) {
    throw new Error(
      "RequestWebServiceDialogButton must be used within RequestWebServiceDialogProvider"
    )
  }
  return context
}

function RequestWebServiceForm({ onSuccess }: { onSuccess: () => void }) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="web-service-firstName" className={labelClassName}>
            First Name
          </label>
          <Input
            id="web-service-firstName"
            name="firstName"
            type="text"
            required
            placeholder="Your name"
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="web-service-lastName" className={labelClassName}>
            Last Name
          </label>
          <Input
            id="web-service-lastName"
            name="lastName"
            type="text"
            required
            placeholder="Last name"
            className={fieldClassName}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="web-service-email" className={labelClassName}>
            Email
          </label>
          <Input
            id="web-service-email"
            name="email"
            type="email"
            required
            placeholder="example@gmail.com"
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="web-service-phone" className={labelClassName}>
            Phone Number
          </label>
          <Input
            id="web-service-phone"
            name="phone"
            type="tel"
            required
            placeholder="e.g. +234 900 000 0000"
            className={fieldClassName}
          />
        </div>
      </div>

      <div>
        <label htmlFor="web-service-niche" className={labelClassName}>
          Business Niche
        </label>
        <Input
          id="web-service-niche"
          name="businessNiche"
          type="text"
          required
          placeholder="e.g. E-commerce, Healthcare, Real Estate"
          className={fieldClassName}
        />
      </div>

      <div>
        <label htmlFor="web-service-description" className={labelClassName}>
          Describe what you want the website to do
        </label>
        <textarea
          id="web-service-description"
          name="description"
          required
          rows={4}
          placeholder="Tell us about your goals, features, target audience, and any specific requirements..."
          className={cn(
            fieldClassName,
            "min-h-[120px] resize-y py-3 leading-relaxed"
          )}
        />
      </div>

      <label className="flex items-start gap-3 text-sm text-muted-foreground">
        <input
          type="checkbox"
          name="privacy"
          required
          className="mt-0.5 size-4 rounded border-border text-brand focus:ring-brand/30"
        />
        <span>
          You agree to our friendly{" "}
          <Link
            href="/privacy-policy"
            className="font-medium text-brand transition-colors hover:text-[#eaaa33]"
          >
            privacy policy
          </Link>
        </span>
      </label>

      <Button
        type="submit"
        className="h-11 w-full rounded-xl bg-brand text-base text-brand-foreground transition-all hover:bg-brand/90"
      >
        Submit
      </Button>
    </form>
  )
}

export function RequestWebServiceDialogProvider({
  children,
}: {
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  return (
    <RequestWebServiceDialogContext.Provider
      value={{ openDialog: () => setOpen(true) }}
    >
      {children}

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen) setSubmitted(false)
        }}
      >
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-xl">
          {submitted ? (
            <div className="py-6 text-center">
              <DialogHeader className="items-center text-center">
                <DialogTitle className="text-xl font-semibold">
                  Request received
                </DialogTitle>
                <DialogDescription className="max-w-sm text-base">
                  Thank you for your request. Our team will review your project
                  details and get back to you within one business day.
                </DialogDescription>
              </DialogHeader>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Request Web Development Service
                </DialogTitle>
                <DialogDescription>
                  Tell us about your business and website goals. We&apos;ll
                  follow up with a tailored proposal.
                </DialogDescription>
              </DialogHeader>

              <RequestWebServiceForm onSuccess={() => setSubmitted(true)} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </RequestWebServiceDialogContext.Provider>
  )
}

export function RequestWebServiceDialogButton({
  className,
  label = "Request service",
}: {
  className?: string
  label?: string
}) {
  const { openDialog } = useRequestWebServiceDialog()

  return (
    <BrandCtaButton className={className} onClick={openDialog}>
      {label}
    </BrandCtaButton>
  )
}

// Backwards-compatible alias for the primary trigger.
export function RequestWebServiceDialog({
  className,
  label = "Request service",
}: {
  className?: string
  label?: string
}) {
  return <RequestWebServiceDialogButton className={className} label={label} />
}
