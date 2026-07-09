"use client"

import Link from "next/link"
import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { brandCtaClassName, BrandCtaIcon } from "@/components/ui/brand-cta-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { DropdownField } from "@/components/ui/dropdown"
import { cn } from "@/lib/utils"

const fieldClassName =
  "h-11 w-full rounded-xl border-border bg-background px-3.5 text-sm md:text-sm"
const labelClassName = "mb-2 block text-sm font-medium text-foreground"

const trainingAreas = [
  "Software Development",
  "Web Development",
  "Mobile App Development",
  "Digital Marketing",
  "Cybersecurity Fundamentals",
  "Corporate Training",
  "Other",
]

function RequestTrainingForm({ onSuccess }: { onSuccess: () => void }) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="training-firstName" className={labelClassName}>
            First Name
          </label>
          <Input
            id="training-firstName"
            name="firstName"
            type="text"
            required
            placeholder="Your name"
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="training-lastName" className={labelClassName}>
            Last Name
          </label>
          <Input
            id="training-lastName"
            name="lastName"
            type="text"
            required
            placeholder="Last name"
            className={fieldClassName}
          />
        </div>
      </div>

      <div>
        <label htmlFor="training-company" className={labelClassName}>
          Company Name
        </label>
        <Input
          id="training-company"
          name="company"
          type="text"
          required
          placeholder="Your organization"
          className={fieldClassName}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="training-email" className={labelClassName}>
            Email
          </label>
          <Input
            id="training-email"
            name="email"
            type="email"
            required
            placeholder="example@gmail.com"
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="training-phone" className={labelClassName}>
            Phone
          </label>
          <Input
            id="training-phone"
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
          <label htmlFor="training-area" className={labelClassName}>
            Training Area
          </label>
          <DropdownField
            id="training-area"
            name="trainingArea"
            placeholder="Select a training area"
            required
            className={fieldClassName}
            options={trainingAreas.map((area) => ({
              value: area,
              label: area,
            }))}
          />
        </div>

        <div>
          <label htmlFor="training-participants" className={labelClassName}>
            Team Size
          </label>
          <Input
            id="training-participants"
            name="participants"
            type="number"
            min={1}
            required
            placeholder="e.g. 15"
            className={fieldClassName}
          />
        </div>
      </div>

      <div>
        <label htmlFor="training-details" className={labelClassName}>
          Training Requirements
        </label>
        <textarea
          id="training-details"
          name="details"
          required
          rows={4}
          placeholder="Tell us about your team's goals, preferred schedule, or specific skills needed..."
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
        Submit Request
      </Button>
    </form>
  )
}

export function RequestTrainingDialog({
  className,
  label = "Request Training",
}: {
  className?: string
  label?: string
}) {
  const [submitted, setSubmitted] = useState(false)

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) setSubmitted(false)
      }}
    >
      <DialogTrigger
        className={cn(brandCtaClassName, className)}
      >
        {label}
        <BrandCtaIcon />
      </DialogTrigger>

      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-xl">
        {submitted ? (
          <div className="py-6 text-center">
            <DialogHeader className="items-center text-center">
              <DialogTitle className="text-xl font-semibold">
                Request received
              </DialogTitle>
              <DialogDescription className="max-w-sm text-base">
                Thank you for your training request. Our team will review your
                details and get back to you within one business day.
              </DialogDescription>
            </DialogHeader>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Request Training
              </DialogTitle>
              <DialogDescription>
                Share your team&apos;s training needs and we&apos;ll prepare a
                tailored program for your organization.
              </DialogDescription>
            </DialogHeader>

            <RequestTrainingForm onSuccess={() => setSubmitted(true)} />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
