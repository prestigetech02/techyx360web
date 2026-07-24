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
import { DropdownField } from "@/components/ui/dropdown"
import { Input } from "@/components/ui/input"
import { recaptchaActions } from "@/lib/recaptcha/actions"
import { getRecaptchaToken } from "@/lib/recaptcha/client"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

const fieldClassName =
  "h-11 w-full rounded-xl border-border bg-background px-3.5 text-sm md:text-sm"
const labelClassName = "mb-2 block text-sm font-medium text-foreground"

const roleOptions = [
  "Frontend Developer",
  "Backend Developer",
  "Full-Stack Developer",
  "Mobile Developer",
  "UI/UX Designer",
  "Product Manager",
  "QA Engineer",
  "DevOps Engineer",
  "Other",
]

const engagementOptions = [
  "Full-time dedicated",
  "Part-time",
  "Project-based",
  "Contract / temporary",
]

const durationOptions = [
  "1–3 months",
  "3–6 months",
  "6–12 months",
  "Ongoing",
]

type RequestTalentDialogContextValue = {
  openDialog: () => void
}

const RequestTalentDialogContext =
  createContext<RequestTalentDialogContextValue | null>(null)

function useRequestTalentDialog() {
  const context = useContext(RequestTalentDialogContext)
  if (!context) {
    throw new Error(
      "RequestTalentDialogButton must be used within RequestTalentDialogProvider"
    )
  }
  return context
}

function RequestTalentForm({ onSuccess }: { onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const form = event.currentTarget
    const formData = new FormData(form)

    const firstName = String(formData.get("firstName") ?? "").trim()
    const lastName = String(formData.get("lastName") ?? "").trim()
    const email = String(formData.get("email") ?? "").trim()
    const phone = String(formData.get("phone") ?? "").trim()
    const company = String(formData.get("company") ?? "").trim()
    const roleNeeded = String(formData.get("roleNeeded") ?? "").trim()
    const engagementType = String(formData.get("engagementType") ?? "").trim()
    const headcount = String(formData.get("headcount") ?? "").trim()
    const duration = String(formData.get("duration") ?? "").trim()
    const details = String(formData.get("details") ?? "").trim()

    setIsSubmitting(true)

    try {
      const recaptchaToken = await getRecaptchaToken(
        recaptchaActions.talentRequest
      )

      const response = await fetch("/api/talent-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          company,
          roleNeeded,
          engagementType,
          headcount,
          duration,
          details,
          recaptchaToken,
        }),
      })

      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        const messageText =
          result.error ?? "Unable to submit your request right now."
        setError(messageText)
        notify.error(messageText)
        return
      }

      form.reset()
      notify.success(
        "Talent request submitted. We'll get back to you within one business day."
      )
      onSuccess()
    } catch {
      const messageText =
        "Unable to submit your request right now. Please try again."
      setError(messageText)
      notify.error(messageText)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="talent-firstName" className={labelClassName}>
            First Name
          </label>
          <Input
            id="talent-firstName"
            name="firstName"
            type="text"
            required
            placeholder="Your name"
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="talent-lastName" className={labelClassName}>
            Last Name
          </label>
          <Input
            id="talent-lastName"
            name="lastName"
            type="text"
            required
            placeholder="Last name"
            className={fieldClassName}
          />
        </div>
      </div>

      <div>
        <label htmlFor="talent-company" className={labelClassName}>
          Company Name
        </label>
        <Input
          id="talent-company"
          name="company"
          type="text"
          required
          placeholder="Your organization"
          className={fieldClassName}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="talent-email" className={labelClassName}>
            Email
          </label>
          <Input
            id="talent-email"
            name="email"
            type="email"
            required
            placeholder="example@gmail.com"
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="talent-phone" className={labelClassName}>
            Phone Number
          </label>
          <Input
            id="talent-phone"
            name="phone"
            type="tel"
            required
            placeholder="e.g. +234 900 000 0000"
            className={fieldClassName}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="talent-role" className={labelClassName}>
            Role Needed
          </label>
          <DropdownField
            id="talent-role"
            name="roleNeeded"
            placeholder="Select a role"
            required
            className={fieldClassName}
            options={roleOptions.map((role) => ({
              value: role,
              label: role,
            }))}
          />
        </div>

        <div>
          <label htmlFor="talent-engagement" className={labelClassName}>
            Engagement Type
          </label>
          <DropdownField
            id="talent-engagement"
            name="engagementType"
            placeholder="Select engagement"
            required
            className={fieldClassName}
            options={engagementOptions.map((option) => ({
              value: option,
              label: option,
            }))}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="talent-headcount" className={labelClassName}>
            Number of People
          </label>
          <Input
            id="talent-headcount"
            name="headcount"
            type="number"
            min={1}
            required
            placeholder="e.g. 2"
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="talent-duration" className={labelClassName}>
            Expected Duration
          </label>
          <DropdownField
            id="talent-duration"
            name="duration"
            placeholder="Select duration"
            required
            className={fieldClassName}
            options={durationOptions.map((option) => ({
              value: option,
              label: option,
            }))}
          />
        </div>
      </div>

      <div>
        <label htmlFor="talent-details" className={labelClassName}>
          Role Requirements
        </label>
        <textarea
          id="talent-details"
          name="details"
          required
          rows={4}
          placeholder="Skills, stack, seniority, start date, and any other requirements..."
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

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full rounded-xl bg-brand text-base text-brand-foreground transition-all hover:bg-brand/90"
      >
        {isSubmitting ? "Submitting..." : "Submit Request"}
      </Button>
    </form>
  )
}

export function RequestTalentDialogProvider({
  children,
}: {
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  return (
    <RequestTalentDialogContext.Provider
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
                  Thank you. Our talent team will review your requirements and
                  get back to you within one business day.
                </DialogDescription>
              </DialogHeader>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Request Talent
                </DialogTitle>
                <DialogDescription>
                  Tell us the roles you need and we&apos;ll match you with
                  vetted tech professionals.
                </DialogDescription>
              </DialogHeader>

              <RequestTalentForm onSuccess={() => setSubmitted(true)} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </RequestTalentDialogContext.Provider>
  )
}

export function RequestTalentDialogButton({
  className,
  label = "Request Talent",
}: {
  className?: string
  label?: string
}) {
  const { openDialog } = useRequestTalentDialog()

  return (
    <BrandCtaButton className={className} onClick={openDialog}>
      {label}
    </BrandCtaButton>
  )
}

export function RequestTalentDialog({
  className,
  label = "Request Talent",
}: {
  className?: string
  label?: string
}) {
  return <RequestTalentDialogButton className={className} label={label} />
}
