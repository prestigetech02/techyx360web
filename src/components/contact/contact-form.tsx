"use client"

import Link from "next/link"
import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { recaptchaActions } from "@/lib/recaptcha/actions"
import { getRecaptchaToken } from "@/lib/recaptcha/client"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

const fieldClassName =
  "h-11 rounded-xl border-border bg-background px-3.5 text-sm md:text-sm"
const labelClassName = "mb-2 block text-sm font-medium text-foreground"

export function ContactForm({ className }: { className?: string }) {
  const [submitted, setSubmitted] = useState(false)
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
      message: String(formData.get("message") ?? ""),
    }

    setIsSubmitting(true)

    try {
      const recaptchaToken = await getRecaptchaToken(recaptchaActions.contact)

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          recaptchaToken,
        }),
      })

      const result = (await response.json()) as {
        error?: string
      }

      if (!response.ok) {
        const message = result.error ?? "Unable to send your message right now."
        setError(message)
        notify.error(message)
        return
      }

      form.reset()
      setSubmitted(true)
      notify.success("Message sent. We'll get back to you within one business day.")
    } catch {
      const message = "Unable to send your message right now. Please try again."
      setError(message)
      notify.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-6 sm:p-8 lg:p-10",
        className
      )}
    >
      {submitted ? (
        <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
          <h2 className="text-2xl font-semibold text-foreground">
            Thank you for reaching out
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Your message has been received. Our team will get back to you within
            one business day.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className={labelClassName}>
                First Name
              </label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                required
                placeholder="Your Name"
                className={fieldClassName}
              />
            </div>

            <div>
              <label htmlFor="lastName" className={labelClassName}>
                Last Name
              </label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                required
                placeholder="Last Name"
                className={fieldClassName}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className={labelClassName}>
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="example@gmail.com"
                className={fieldClassName}
              />
            </div>

            <div>
              <label htmlFor="phone" className={labelClassName}>
                Phone
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="e.g. +234 900 000 0000"
                className={fieldClassName}
              />
            </div>
          </div>

          <div className="w-full">
            <label htmlFor="message" className={labelClassName}>
              How can we help you?
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              placeholder="Your message..."
              className={cn(
                fieldClassName,
                "w-full min-h-[160px] resize-y py-3 leading-relaxed"
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
            className="h-12 w-full rounded-xl bg-brand text-base text-brand-foreground transition-all hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      )}
    </div>
  )
}
