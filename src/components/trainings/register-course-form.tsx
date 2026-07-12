"use client"

import Link from "next/link"
import { FormEvent, useState } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { evaCourseSlug } from "@/config/executive-virtual-assistance"
import { getCourseKey } from "@/config/training-schools"
import { submitCourseRegistration } from "@/lib/registrations"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

const fieldClassName =
  "h-11 w-full rounded-xl border-border bg-background px-3.5 text-sm md:text-sm"
const labelClassName = "mb-2 block text-sm font-medium text-foreground"

function YesNoField({
  name,
  label,
  description,
}: {
  name: string
  label: string
  description?: string
}) {
  return (
    <fieldset>
      <legend className={labelClassName}>{label}</legend>
      {description ? (
        <p className="mb-3 text-sm text-muted-foreground">{description}</p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {(["yes", "no"] as const).map((value) => (
          <label
            key={value}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-border/60 bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-brand/30"
          >
            <input
              type="radio"
              name={name}
              value={value}
              required
              className="size-4 border-border text-brand focus:ring-brand/30"
            />
            {value === "yes" ? "Yes" : "No"}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

type RegisterCourseFormProps = {
  schoolId: string
  courseSlug: string
  courseTitle: string
  schoolName: string
  onSuccess?: () => void
  showSelectedCourse?: boolean
}

export function RegisterCourseForm({
  schoolId,
  courseSlug,
  courseTitle,
  schoolName,
  onSuccess,
  showSelectedCourse = true,
}: RegisterCourseFormProps) {
  const courseValue = getCourseKey(schoolId, courseSlug)
  const isEvaCourse = courseSlug === evaCourseSlug
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      schoolId,
      schoolName,
      courseSlug,
      courseTitle,
      courseKey: courseValue,
      message: String(formData.get("message") ?? ""),
      registrationType: "course" as const,
      ...(isEvaCourse
        ? {
            location: String(formData.get("location") ?? ""),
            hasWorkingComputer:
              String(formData.get("hasWorkingComputer") ?? "") === "yes",
            canDevote6HoursWeekly:
              String(formData.get("canDevote6HoursWeekly") ?? "") === "yes",
          }
        : {}),
    }

    setIsSubmitting(true)

    try {
      await submitCourseRegistration(payload)

      form.reset()
      notify.success(
        "Registration submitted. Our team will contact you shortly."
      )
      onSuccess?.()
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to submit your registration right now. Please try again."
      setError(message)
      notify.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="school" value={schoolId} />
      <input type="hidden" name="course" value={courseValue} />

      {showSelectedCourse && (
        <div className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3">
          <p className="text-xs font-semibold tracking-[0.16em] text-brand uppercase">
            Selected program
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {courseTitle}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{schoolName}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="register-firstName" className={labelClassName}>
            First Name
          </label>
          <Input
            id="register-firstName"
            name="firstName"
            type="text"
            required
            placeholder="Your name"
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="register-lastName" className={labelClassName}>
            Last Name
          </label>
          <Input
            id="register-lastName"
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
          <label htmlFor="register-email" className={labelClassName}>
            Email
          </label>
          <Input
            id="register-email"
            name="email"
            type="email"
            required
            placeholder="example@gmail.com"
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="register-phone" className={labelClassName}>
            Phone
          </label>
          <Input
            id="register-phone"
            name="phone"
            type="tel"
            required
            placeholder="e.g. +234 900 000 0000"
            className={fieldClassName}
          />
        </div>
      </div>

      {isEvaCourse ? (
        <>
          <div>
            <label htmlFor="register-location" className={labelClassName}>
              Location
            </label>
            <Input
              id="register-location"
              name="location"
              type="text"
              required
              placeholder="e.g. Lagos, Nigeria"
              className={fieldClassName}
            />
          </div>

          <YesNoField
            name="hasWorkingComputer"
            label="Do you have a working computer?"
          />

          <YesNoField
            name="canDevote6HoursWeekly"
            label="Can you devote a maximum of 6 hours per week?"
            description="This helps us confirm you can keep up with the 10-week EVA program schedule."
          />
        </>
      ) : null}

      <div>
        <label htmlFor="register-message" className={labelClassName}>
          Additional Notes{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="register-message"
          name="message"
          rows={4}
          placeholder="Tell us about your goals, preferred start date, or any questions you have..."
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
        className={cn(
          buttonVariants(),
          "h-11 w-full rounded-xl bg-brand text-base text-brand-foreground transition-all duration-300 hover:scale-[1.02] hover:bg-[#eaaa33] hover:text-[#1a1408] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        )}
      >
        {isSubmitting ? "Submitting..." : "Submit Registration"}
      </Button>
    </form>
  )
}
