"use client"

import Link from "next/link"
import {
  FormEvent,
  createContext,
  useContext,
  useMemo,
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
import { trainingSchools } from "@/config/training-schools"
import {
  buildSiwesRegistrationPayload,
  submitCourseRegistration,
} from "@/lib/registrations"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

const fieldClassName =
  "h-11 w-full rounded-xl border-border bg-background px-3.5 text-sm md:text-sm"
const labelClassName = "mb-2 block text-sm font-medium text-foreground"

const durationOptions = [
  { value: "3-months", label: "3 Months" },
  { value: "6-months", label: "6 Months" },
]

type ApplySiwesDialogContextValue = {
  openDialog: () => void
}

const ApplySiwesDialogContext =
  createContext<ApplySiwesDialogContextValue | null>(null)

function useApplySiwesDialog() {
  const context = useContext(ApplySiwesDialogContext)
  if (!context) {
    throw new Error(
      "ApplySiwesDialogButton must be used within ApplySiwesDialogProvider"
    )
  }
  return context
}

function ApplySiwesForm({ onSuccess }: { onSuccess: () => void }) {
  const courseOptions = useMemo(
    () =>
      trainingSchools.flatMap((school) =>
        school.courses.map((course) => ({
          value: course.slug,
          label: course.title,
        }))
      ),
    []
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const form = event.currentTarget
    const formData = new FormData(form)

    const payload = buildSiwesRegistrationPayload({
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      location: String(formData.get("location") ?? ""),
      courseSlug: String(formData.get("course") ?? ""),
      duration: String(formData.get("duration") ?? ""),
      otherInfo: String(formData.get("otherInfo") ?? ""),
    })

    if ("error" in payload) {
      setError(payload.error)
      notify.error(payload.error)
      return
    }

    setIsSubmitting(true)

    try {
      await submitCourseRegistration(payload)
      form.reset()
      notify.success(
        "Application submitted. Our team will review your details shortly."
      )
      onSuccess()
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit your application right now. Please try again."
      setError(message)
      notify.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="siwes-firstName" className={labelClassName}>
            First Name
          </label>
          <Input
            id="siwes-firstName"
            name="firstName"
            type="text"
            required
            placeholder="Your name"
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="siwes-lastName" className={labelClassName}>
            Last Name
          </label>
          <Input
            id="siwes-lastName"
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
          <label htmlFor="siwes-email" className={labelClassName}>
            Email
          </label>
          <Input
            id="siwes-email"
            name="email"
            type="email"
            required
            placeholder="example@gmail.com"
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="siwes-phone" className={labelClassName}>
            Phone Number
          </label>
          <Input
            id="siwes-phone"
            name="phone"
            type="tel"
            required
            placeholder="e.g. +234 900 000 0000"
            className={fieldClassName}
          />
        </div>
      </div>

      <div>
        <label htmlFor="siwes-location" className={labelClassName}>
          Location
        </label>
        <Input
          id="siwes-location"
          name="location"
          type="text"
          required
          placeholder="e.g. Lagos, Nigeria"
          className={fieldClassName}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="siwes-course" className={labelClassName}>
            Course
          </label>
          <DropdownField
            id="siwes-course"
            name="course"
            placeholder="Select a course"
            required
            className={fieldClassName}
            options={courseOptions}
          />
        </div>

        <div>
          <label htmlFor="siwes-duration" className={labelClassName}>
            Duration
          </label>
          <DropdownField
            id="siwes-duration"
            name="duration"
            placeholder="Select duration"
            required
            className={fieldClassName}
            options={durationOptions}
          />
        </div>
      </div>

      <div>
        <label htmlFor="siwes-otherInfo" className={labelClassName}>
          Any Other Information
        </label>
        <textarea
          id="siwes-otherInfo"
          name="otherInfo"
          rows={4}
          placeholder="Institution, department, preferred start date, or anything else we should know..."
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

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full rounded-xl bg-brand text-base text-brand-foreground transition-all duration-300 hover:scale-[1.02] hover:bg-[#eaaa33] hover:text-[#1a1408] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  )
}

export function ApplySiwesDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  return (
    <ApplySiwesDialogContext.Provider
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
                  Application received
                </DialogTitle>
                <DialogDescription className="max-w-sm text-base">
                  Thank you for applying to our SIWES / Industrial Training
                  program. Our team will review your details and get back to you
                  shortly.
                </DialogDescription>
              </DialogHeader>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Apply for SIWES / IT Placement
                </DialogTitle>
                <DialogDescription>
                  Fill in your details below and we&apos;ll guide you through
                  the next steps of your industrial training placement.
                </DialogDescription>
              </DialogHeader>

              <ApplySiwesForm onSuccess={() => setSubmitted(true)} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </ApplySiwesDialogContext.Provider>
  )
}

export function ApplySiwesDialogButton({
  className,
  label = "Apply for SIWES",
}: {
  className?: string
  label?: string
}) {
  const { openDialog } = useApplySiwesDialog()

  return (
    <BrandCtaButton className={className} onClick={openDialog}>
      {label}
    </BrandCtaButton>
  )
}
