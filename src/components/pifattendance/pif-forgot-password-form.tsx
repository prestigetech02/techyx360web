"use client"

import Image from "next/image"
import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"

import { BrandCtaButton } from "@/components/ui/brand-cta-button"
import { Input } from "@/components/ui/input"
import { brand } from "@/config/brand"
import { PIF_ATTENDANCE_LOGIN_PATH } from "@/lib/pifattendance/auth-paths"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

const fieldClassName =
  "h-11 rounded-xl border-border bg-background px-3.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

export function PifForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("email")
    if (value) setEmail(value)
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const address = email.trim()
    if (!address.includes("@")) {
      const message = "Enter the email address you use to sign in."
      setError(message)
      notify.error(message)
      return
    }

    if (!isSupabaseConfigured()) {
      const message =
        "Supabase is not configured yet. Add your project keys to .env.local."
      setError(message)
      notify.error(message)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: address, portal: "pifattendance" }),
      })
      const data = (await response.json().catch(() => null)) as {
        error?: string
      } | null

      if (!response.ok) {
        const message =
          data?.error ||
          "Unable to send reset email right now. Please try again."
        setError(message)
        notify.error(message)
        return
      }

      setSent(true)
      notify.success("Password reset link sent. Check your inbox.")
    } catch {
      const message = "Unable to send reset email right now. Please try again."
      setError(message)
      notify.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-center px-4">
          <Link href="/" className="inline-flex">
            <Image
              src={brand.logo.light}
              alt={brand.name}
              width={160}
              height={40}
              className="h-8 w-auto dark:hidden"
            />
            <Image
              src={brand.logo.dark}
              alt={brand.name}
              width={160}
              height={40}
              className="hidden h-8 w-auto dark:block"
            />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Reset password
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Enter your fellow email and we will send a reset link.
            </p>
          </div>

          {sent ? (
            <div className="mt-8 space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                If that email is registered, a reset link is on the way.
              </p>
              <BrandCtaButton
                href={PIF_ATTENDANCE_LOGIN_PATH}
                className="w-full"
              >
                Back to sign in
              </BrandCtaButton>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label
                  htmlFor="pif-forgot-email"
                  className="mb-1.5 block text-xs font-medium text-foreground"
                >
                  Email
                </label>
                <Input
                  id="pif-forgot-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@email.com"
                  className={fieldClassName}
                />
              </div>

              {error ? (
                <p role="alert" className="text-sm text-red-600">
                  {error}
                </p>
              ) : null}

              <BrandCtaButton
                type="submit"
                className={cn(
                  "w-full",
                  isSubmitting && "pointer-events-none opacity-70"
                )}
              >
                {isSubmitting ? "Sending..." : "Send reset link"}
              </BrandCtaButton>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link
              href={PIF_ATTENDANCE_LOGIN_PATH}
              className="font-medium text-brand hover:underline"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </main>

      <footer className="border-t border-border/60 px-4 py-4">
        <p className="text-center text-xs text-muted-foreground">
          For Product Innovation Fellowship fellows only.
        </p>
      </footer>
    </div>
  )
}
