"use client"

import Link from "next/link"
import { FormEvent, useMemo, useState, type ReactNode } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { DropdownField } from "@/components/ui/dropdown"
import { Input } from "@/components/ui/input"
import { PifPaymentSection } from "@/components/trainings/pif-payment-section"
import { pifLearningTracks } from "@/config/product-innovation-fellowship"
import { submitPifApplication } from "@/lib/pif-applications"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

const fieldClassName =
  "h-11 w-full rounded-xl border-border bg-background px-3.5 text-sm md:text-sm"
const labelClassName = "mb-2 block text-sm font-medium text-foreground"
const textareaClassName = cn(
  fieldClassName,
  "min-h-[120px] resize-y py-3 leading-relaxed"
)

function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-4 border-t border-border/70 pt-6 first:border-t-0 first:pt-0">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  )
}

export function PifApplyForm() {
  const trackOptions = useMemo(
    () =>
      pifLearningTracks.map((track) => ({
        value: track,
        label: track,
      })),
    []
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const form = event.currentTarget
    const formData = new FormData(form)

    const payload = {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      educationExperience: String(formData.get("educationExperience") ?? ""),
      preferredTrack: String(formData.get("preferredTrack") ?? ""),
      portfolioUrl: String(formData.get("portfolioUrl") ?? ""),
      motivation: String(formData.get("motivation") ?? ""),
      goals: String(formData.get("goals") ?? ""),
      programCommitmentAgreed: formData.get("programCommitment") === "on",
    }

    const paymentReceipt = formData.get("paymentReceipt")
    if (!(paymentReceipt instanceof File) || paymentReceipt.size === 0) {
      const message = "Please upload your payment receipt before submitting."
      setError(message)
      notify.error(message)
      return
    }

    setIsSubmitting(true)

    try {
      await submitPifApplication(payload, paymentReceipt)
      form.reset()
      setSubmitted(true)
      notify.success(
        "Application submitted. Our team will review your details and get in touch."
      )
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

  if (submitted) {
    return (
      <div className="rounded-2xl border border-brand/20 bg-brand/5 px-6 py-10 text-center">
        <p className="text-xs font-semibold tracking-[0.16em] text-brand uppercase">
          Application received
        </p>
        <h2 className="mt-3 text-xl font-semibold text-foreground">
          Thank you for applying
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          We have received your Product Innovation Fellowship application. Our
          team will review it and contact you with next steps.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/trainings/product-innovation-fellowship"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-11 rounded-xl px-5"
            )}
          >
            Back to fellowship page
          </Link>
          <Button
            type="button"
            className={cn(
              buttonVariants(),
              "h-11 rounded-xl bg-brand text-brand-foreground hover:bg-[#eaaa33] hover:text-[#1a1408]"
            )}
            onClick={() => setSubmitted(false)}
          >
            Submit another application
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection title="Personal Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pif-firstName" className={labelClassName}>
              First Name
            </label>
            <Input
              id="pif-firstName"
              name="firstName"
              type="text"
              required
              placeholder="Your name"
              className={fieldClassName}
            />
          </div>

          <div>
            <label htmlFor="pif-lastName" className={labelClassName}>
              Last Name
            </label>
            <Input
              id="pif-lastName"
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
            <label htmlFor="pif-email" className={labelClassName}>
              Email
            </label>
            <Input
              id="pif-email"
              name="email"
              type="email"
              required
              placeholder="example@gmail.com"
              className={fieldClassName}
            />
          </div>

          <div>
            <label htmlFor="pif-phone" className={labelClassName}>
              Phone
            </label>
            <Input
              id="pif-phone"
              name="phone"
              type="tel"
              required
              placeholder="e.g. +234 900 000 0000"
              className={fieldClassName}
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Education / Experience"
        description="Tell us about your background, studies, and any relevant work or project experience."
      >
        <div>
          <label htmlFor="pif-educationExperience" className={labelClassName}>
            Education &amp; Experience
          </label>
          <textarea
            id="pif-educationExperience"
            name="educationExperience"
            rows={5}
            required
            placeholder="Your degree, certifications, internships, roles, or projects that relate to your chosen track..."
            className={textareaClassName}
          />
        </div>
      </FormSection>

      <FormSection title="Preferred Track">
        <div>
          <label htmlFor="pif-preferredTrack" className={labelClassName}>
            Learning Track
          </label>
          <DropdownField
            id="pif-preferredTrack"
            name="preferredTrack"
            placeholder="Select your preferred track"
            required
            className={fieldClassName}
            options={trackOptions}
          />
        </div>
      </FormSection>

      <FormSection title="Portfolio / GitHub / Behance">
        <div>
          <label htmlFor="pif-portfolioUrl" className={labelClassName}>
            Portfolio link{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <Input
            id="pif-portfolioUrl"
            name="portfolioUrl"
            type="url"
            placeholder="https://github.com/you or https://behance.net/you"
            className={fieldClassName}
          />
        </div>
      </FormSection>

      <FormSection title="Why do you want to join?">
        <div>
          <label htmlFor="pif-motivation" className={labelClassName}>
            Your motivation
          </label>
          <textarea
            id="pif-motivation"
            name="motivation"
            rows={4}
            required
            placeholder="What draws you to the Product Innovation Fellowship and this kind of learning experience?"
            className={textareaClassName}
          />
        </div>
      </FormSection>

      <FormSection title="What do you hope to achieve?">
        <div>
          <label htmlFor="pif-goals" className={labelClassName}>
            Your goals
          </label>
          <textarea
            id="pif-goals"
            name="goals"
            rows={4}
            required
            placeholder="What skills, outcomes, or career milestones do you want from the fellowship?"
            className={textareaClassName}
          />
        </div>
      </FormSection>

      <FormSection
        title="Payment"
        description="Pay the fellowship fee and upload your transfer receipt to complete your application."
      >
        <PifPaymentSection disabled={isSubmitting} />
      </FormSection>

      <div className="space-y-4 border-t border-border/70 pt-6">
        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <input
            type="checkbox"
            name="programCommitment"
            required
            className="mt-0.5 size-4 rounded border-border text-brand focus:ring-brand/30"
          />
          <span>
            I agree to commit to the full 12-week Product Innovation Fellowship
            program, including active participation in bootcamp sessions, team
            collaboration, and the Product Innovation Lab.
          </span>
        </label>

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
            .
          </span>
        </label>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          buttonVariants(),
          "h-11 w-full rounded-xl bg-brand text-base text-brand-foreground transition-all duration-300 hover:scale-[1.02] hover:bg-[#eaaa33] hover:text-[#1a1408] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        )}
      >
        {isSubmitting ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  )
}
