"use client"

import Link from "next/link"
import {
  FormEvent,
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react"
import { UserRound } from "lucide-react"

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
import { submitTalentPoolApplication } from "@/lib/careers/talent-pool"
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

type JoinTalentPoolDialogContextValue = {
  openDialog: () => void
}

const JoinTalentPoolDialogContext =
  createContext<JoinTalentPoolDialogContextValue | null>(null)

function useJoinTalentPoolDialog() {
  const context = useContext(JoinTalentPoolDialogContext)
  if (!context) {
    throw new Error(
      "JoinTalentPoolDialogButton must be used within JoinTalentPoolDialogProvider"
    )
  }
  return context
}

function JoinTalentPoolForm({ onSuccess }: { onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cvName, setCvName] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const form = event.currentTarget
    const formData = new FormData(form)

    const cv = formData.get("cv")
    if (!(cv instanceof File) || cv.size === 0) {
      const message = "Please upload your CV before submitting."
      setError(message)
      notify.error(message)
      return
    }

    setIsSubmitting(true)

    try {
      await submitTalentPoolApplication(formData)
      form.reset()
      setCvName(null)
      notify.success(
        "You're in the talent pool. We'll reach out when a suitable role opens up."
      )
      onSuccess()
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit your details right now. Please try again."
      setError(message)
      notify.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="talent-fullName" className={labelClassName}>
          Name
          <RequiredMark />
        </label>
        <Input
          id="talent-fullName"
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
          <label htmlFor="talent-email" className={labelClassName}>
            Email
            <RequiredMark />
          </label>
          <Input
            id="talent-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="example@gmail.com"
            className={fieldClassName}
          />
        </div>
        <div>
          <label htmlFor="talent-phone" className={labelClassName}>
            Phone{" "}
            <span className="font-normal text-muted-foreground">
              (preferably WhatsApp)
            </span>
            <RequiredMark />
          </label>
          <Input
            id="talent-phone"
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
        <label htmlFor="talent-location" className={labelClassName}>
          Location
          <RequiredMark />
        </label>
        <Input
          id="talent-location"
          name="location"
          type="text"
          required
          autoComplete="address-level2"
          placeholder="e.g. Lagos, Nigeria"
          className={fieldClassName}
        />
      </div>

      <div>
        <label htmlFor="talent-interest" className={labelClassName}>
          Roles you&apos;re interested in
          <RequiredMark />
        </label>
        <Input
          id="talent-interest"
          name="interestAreas"
          type="text"
          required
          placeholder="e.g. Full Stack Developer, UI/UX Designer"
          className={fieldClassName}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="talent-linkedin" className={labelClassName}>
            LinkedIn{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <Input
            id="talent-linkedin"
            name="linkedinUrl"
            type="url"
            placeholder="https://linkedin.com/in/..."
            className={fieldClassName}
          />
        </div>
        <div>
          <label htmlFor="talent-github" className={labelClassName}>
            GitHub{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <Input
            id="talent-github"
            name="githubUrl"
            type="url"
            placeholder="https://github.com/..."
            className={fieldClassName}
          />
        </div>
      </div>

      <div>
        <label htmlFor="talent-portfolio" className={labelClassName}>
          Portfolio{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <Input
          id="talent-portfolio"
          name="portfolioUrl"
          type="url"
          placeholder="https://your-portfolio.com"
          className={fieldClassName}
        />
      </div>

      <div>
        <label htmlFor="talent-cv" className={labelClassName}>
          CV Upload
          <RequiredMark />
        </label>
        <label
          htmlFor="talent-cv"
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
            id="talent-cv"
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
          <label htmlFor="talent-experience" className={labelClassName}>
            Years of Experience
            <RequiredMark />
          </label>
          <DropdownField
            id="talent-experience"
            name="yearsOfExperience"
            placeholder="Select experience"
            required
            className={fieldClassName}
            options={[...careerExperienceOptions]}
          />
        </div>
        <div>
          <label htmlFor="talent-salary" className={labelClassName}>
            Expected Salary{" "}
            <span className="font-normal text-muted-foreground">
              (per month, optional)
            </span>
          </label>
          <Input
            id="talent-salary"
            name="expectedSalary"
            type="text"
            placeholder="e.g. ₦400,000"
            className={fieldClassName}
          />
        </div>
      </div>

      <div>
        <label htmlFor="talent-message" className={labelClassName}>
          About you{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="talent-message"
          name="message"
          rows={4}
          placeholder="Tell us briefly about your background and what you're looking for..."
          className={cn(
            fieldClassName,
            "min-h-[110px] resize-y py-3 leading-relaxed"
          )}
        />
      </div>

      <div>
        <label htmlFor="talent-availability" className={labelClassName}>
          Availability
          <RequiredMark />
        </label>
        <DropdownField
          id="talent-availability"
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
        {isSubmitting ? "Submitting..." : "Join Talent Pool"}
      </Button>
    </form>
  )
}

export function JoinTalentPoolDialogProvider({
  children,
}: {
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  return (
    <JoinTalentPoolDialogContext.Provider
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
                  You&apos;re on the list
                </DialogTitle>
                <DialogDescription className="max-w-sm text-base">
                  Thanks for joining the Techyx360 talent pool. We&apos;ll reach
                  out when a role that matches your profile opens up.
                </DialogDescription>
              </DialogHeader>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Join Our Talent Pool
                </DialogTitle>
                <DialogDescription>
                  Share your details and CV. We&apos;ll keep you in mind for
                  future openings that fit.
                </DialogDescription>
              </DialogHeader>

              <JoinTalentPoolForm onSuccess={() => setSubmitted(true)} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </JoinTalentPoolDialogContext.Provider>
  )
}

export function JoinTalentPoolDialogButton({
  className,
  label = "Join Our Talent Pool",
  variant = "outline",
}: {
  className?: string
  label?: string
  variant?: "brand" | "outline" | "hero"
}) {
  const { openDialog } = useJoinTalentPoolDialog()

  if (variant === "brand") {
    return (
      <BrandCtaButton className={className} onClick={openDialog}>
        {label}
      </BrandCtaButton>
    )
  }

  if (variant === "hero") {
    return (
      <button
        type="button"
        onClick={openDialog}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-11 gap-2 border-white/35 bg-transparent px-6 text-base text-white transition-all duration-300 hover:border-white hover:bg-white/10 hover:text-white active:scale-[0.98] sm:h-12",
          className
        )}
      >
        <UserRound className="size-4" aria-hidden />
        {label}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={openDialog}
      className={cn(
        buttonVariants({ variant: "outline" }),
        "h-11 w-full gap-2 border-brand/40 text-base text-brand transition-all duration-300 hover:border-brand hover:bg-brand/10 hover:text-brand active:scale-[0.98] sm:h-12",
        className
      )}
    >
      <UserRound className="size-4" aria-hidden />
      {label}
    </button>
  )
}
