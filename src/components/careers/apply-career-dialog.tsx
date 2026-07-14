"use client"

import Link from "next/link"
import {
  FormEvent,
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react"

import { BrandCtaButton } from "@/components/ui/brand-cta-button"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownField } from "@/components/ui/dropdown"
import { Input } from "@/components/ui/input"
import {
  careerAvailabilityOptions,
  careerExperienceOptions,
} from "@/config/careers"
import { submitCareerApplication } from "@/lib/careers/applications"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

const fieldClassName =
  "h-11 w-full rounded-xl border-border bg-background px-3.5 text-sm md:text-sm"
const labelClassName = "mb-2 block text-sm font-medium text-foreground"

function RequiredMark() {
  return (
    <span className="text-red-600" aria-hidden>
      {" "}
      *
    </span>
  )
}

type ApplyCareerDialogContextValue = {
  openDialog: () => void
  positionId: string
  positionTitle: string
}

const ApplyCareerDialogContext =
  createContext<ApplyCareerDialogContextValue | null>(null)

function useApplyCareerDialog() {
  const context = useContext(ApplyCareerDialogContext)
  if (!context) {
    throw new Error(
      "ApplyCareerDialogButton must be used within ApplyCareerDialogProvider"
    )
  }
  return context
}

function ApplyCareerForm({
  positionId,
  positionTitle,
  onSuccess,
}: {
  positionId: string
  positionTitle: string
  onSuccess: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cvName, setCvName] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const form = event.currentTarget
    const formData = new FormData(form)
    formData.set("positionId", positionId)

    const cv = formData.get("cv")
    if (!(cv instanceof File) || cv.size === 0) {
      const message = "Please upload your CV before submitting."
      setError(message)
      notify.error(message)
      return
    }

    setIsSubmitting(true)

    try {
      await submitCareerApplication(formData)
      form.reset()
      setCvName(null)
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
      <input type="hidden" name="positionId" value={positionId} />

      <div className="rounded-xl border border-brand/20 bg-brand/5 px-3.5 py-3 text-sm text-muted-foreground">
        Applying for{" "}
        <span className="font-semibold text-foreground">{positionTitle}</span>
      </div>

      <div>
        <label htmlFor="career-fullName" className={labelClassName}>
          Name
          <RequiredMark />
        </label>
        <Input
          id="career-fullName"
          name="fullName"
          type="text"
          required
          autoComplete="name"
          placeholder="Your full name"
          className={fieldClassName}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="career-email" className={labelClassName}>
            Email
            <RequiredMark />
          </label>
          <Input
            id="career-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="example@gmail.com"
            className={fieldClassName}
          />
        </div>
        <div>
          <label htmlFor="career-phone" className={labelClassName}>
            Phone{" "}
            <span className="font-normal text-muted-foreground">
              (preferably WhatsApp)
            </span>
            <RequiredMark />
          </label>
          <Input
            id="career-phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            placeholder="e.g. +234 900 000 0000"
            className={fieldClassName}
          />
        </div>
      </div>

      <div>
        <label htmlFor="career-location" className={labelClassName}>
          Location
          <RequiredMark />
        </label>
        <Input
          id="career-location"
          name="location"
          type="text"
          required
          autoComplete="address-level2"
          placeholder="e.g. Lagos, Nigeria"
          className={fieldClassName}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="career-linkedin" className={labelClassName}>
            LinkedIn{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <Input
            id="career-linkedin"
            name="linkedinUrl"
            type="url"
            placeholder="https://linkedin.com/in/..."
            className={fieldClassName}
          />
        </div>
        <div>
          <label htmlFor="career-github" className={labelClassName}>
            GitHub{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <Input
            id="career-github"
            name="githubUrl"
            type="url"
            placeholder="https://github.com/..."
            className={fieldClassName}
          />
        </div>
      </div>

      <div>
        <label htmlFor="career-portfolio" className={labelClassName}>
          Portfolio
          <RequiredMark />
        </label>
        <Input
          id="career-portfolio"
          name="portfolioUrl"
          type="url"
          required
          placeholder="https://your-portfolio.com"
          className={fieldClassName}
        />
      </div>

      <div>
        <label htmlFor="career-cv" className={labelClassName}>
          CV Upload
          <RequiredMark />
        </label>
        <label
          htmlFor="career-cv"
          className={cn(
            fieldClassName,
            "flex cursor-pointer items-center justify-between gap-3 border border-dashed border-border bg-muted/30 hover:bg-muted/50"
          )}
        >
          <span className="truncate text-muted-foreground">
            {cvName ?? "PDF, DOC, or DOCX · max 5 MB"}
          </span>
          <span className="shrink-0 text-xs font-semibold text-brand">
            Browse
          </span>
          <input
            id="career-cv"
            name="cv"
            type="file"
            required
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0]
              setCvName(file?.name ?? null)
            }}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="career-experience" className={labelClassName}>
            Years of Experience
            <RequiredMark />
          </label>
          <DropdownField
            id="career-experience"
            name="yearsOfExperience"
            placeholder="Select experience"
            required
            className={fieldClassName}
            options={[...careerExperienceOptions]}
          />
        </div>
        <div>
          <label htmlFor="career-salary" className={labelClassName}>
            Expected Salary{" "}
            <span className="font-normal text-muted-foreground">
              (per month)
            </span>
            <RequiredMark />
          </label>
          <Input
            id="career-salary"
            name="expectedSalary"
            type="text"
            required
            placeholder="e.g. ₦400,000"
            className={fieldClassName}
          />
        </div>
      </div>

      <div>
        <label htmlFor="career-coverLetter" className={labelClassName}>
          Cover Letter{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="career-coverLetter"
          name="coverLetter"
          rows={4}
          placeholder="Tell us why you're a great fit for this role..."
          className={cn(
            fieldClassName,
            "min-h-[110px] resize-y py-3 leading-relaxed"
          )}
        />
      </div>

      <div>
        <label htmlFor="career-availability" className={labelClassName}>
          Availability
          <RequiredMark />
        </label>
        <DropdownField
          id="career-availability"
          name="availability"
          placeholder="When can you start?"
          required
          className={fieldClassName}
          options={[...careerAvailabilityOptions]}
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
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  )
}

export function ApplyCareerDialogProvider({
  children,
  positionId,
  positionTitle,
}: {
  children: ReactNode
  positionId: string
  positionTitle: string
}) {
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  return (
    <ApplyCareerDialogContext.Provider
      value={{
        openDialog: () => setOpen(true),
        positionId,
        positionTitle,
      }}
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
                  Thank you for applying for {positionTitle}. Our team will
                  review your application and get back to you shortly.
                </DialogDescription>
              </DialogHeader>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Apply for this role
                </DialogTitle>
                <DialogDescription>
                  Share your details below and we&apos;ll review your application
                  for {positionTitle}.
                </DialogDescription>
              </DialogHeader>

              <ApplyCareerForm
                positionId={positionId}
                positionTitle={positionTitle}
                onSuccess={() => setSubmitted(true)}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </ApplyCareerDialogContext.Provider>
  )
}

export function ApplyCareerDialogButton({
  className,
  label = "Apply Now",
  variant = "brand",
}: {
  className?: string
  label?: string
  variant?: "brand" | "outline"
}) {
  const { openDialog } = useApplyCareerDialog()

  if (variant === "outline") {
    return (
      <button
        type="button"
        onClick={openDialog}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-11 gap-2 border-brand/40 px-6 text-base text-brand transition-all duration-300 hover:border-brand hover:bg-brand/10 hover:text-brand active:scale-[0.98] sm:h-12",
          className
        )}
      >
        {label}
      </button>
    )
  }

  return (
    <BrandCtaButton className={className} onClick={openDialog}>
      {label}
    </BrandCtaButton>
  )
}
