"use client"

import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { BrandCtaButton } from "@/components/ui/brand-cta-button"
import { Input } from "@/components/ui/input"
import { brand } from "@/config/brand"
import { testimonials } from "@/config/testimonials"
import { createClient } from "@/lib/supabase/client"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

const fieldClassName =
  "h-12 rounded-xl border-border/80 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:border-brand focus-visible:ring-brand/20 dark:bg-white dark:text-zinc-900"

const featuredTestimonial = testimonials[0]

export function AdminAcceptInviteForm() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setInviteError(
        "Supabase is not configured yet. Add your project keys to .env.local."
      )
      setChecking(false)
      return
    }

    const supabase = createClient()
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")
    const urlError =
      params.get("error_description") || params.get("error") || null

    async function establishSession() {
      if (urlError) {
        setInviteError(urlError.replace(/\+/g, " "))
        setChecking(false)
        return
      }

      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          setInviteError(
            exchangeError.message ||
              "This invite link is invalid or has expired."
          )
          setChecking(false)
          return
        }
      }

      const { data } = await supabase.auth.getSession()
      setHasSession(Boolean(data.session))
      if (!data.session) {
        setInviteError(
          "This invite link is invalid or has expired. Ask an admin to send a new invite."
        )
      }
      setChecking(false)
    }

    void establishSession()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (password.length < 8) {
      const message = "Password must be at least 8 characters."
      setError(message)
      notify.error(message)
      return
    }

    if (password !== confirmPassword) {
      const message = "Passwords do not match."
      setError(message)
      notify.error(message)
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        setError(updateError.message)
        notify.error(updateError.message)
        return
      }

      notify.success("Password saved. Welcome in.")
      router.push("/admin")
      router.refresh()
    } catch {
      const message = "Unable to save your password right now. Please try again."
      setError(message)
      notify.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80"
          alt=""
          aria-hidden
          fill
          priority
          unoptimized
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#0b2c66]/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b2c66]/80 via-[#0b2c66]/35 to-[#0b2c66]/25" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-12">
          <Link href="/" className="inline-flex">
            <Image
              src={brand.logo.dark}
              alt={brand.name}
              width={220}
              height={56}
              priority
              className="h-10 w-auto xl:h-12"
            />
          </Link>
          <div className="max-w-md">
            <p className="text-lg leading-relaxed text-white/90 xl:text-xl">
              &ldquo;{featuredTestimonial.quote}&rdquo;
            </p>
            <p className="mt-6 text-base font-semibold text-white">
              {featuredTestimonial.name}
            </p>
            <p className="text-sm text-white/70">{featuredTestimonial.role}</p>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10 sm:px-8 dark:bg-[#0f1524]">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="inline-flex">
              <Image
                src={brand.logo.light}
                alt={brand.name}
                width={200}
                height={50}
                className="h-10 w-auto dark:hidden"
              />
              <Image
                src={brand.logo.dark}
                alt={brand.name}
                width={200}
                height={50}
                className="hidden h-10 w-auto dark:block"
              />
            </Link>
          </div>

          <div className="text-center">
            <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
              Staff workspace
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#0b2c66] dark:text-white">
              Set your password
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Accept your invitation and choose a password to sign in.
            </p>
          </div>

          {checking ? (
            <p className="mt-8 text-center text-sm text-zinc-500">
              Checking your invite...
            </p>
          ) : !hasSession ? (
            <div className="mt-8 space-y-4 text-center">
              <p role="alert" className="text-sm text-red-600">
                {inviteError ?? "This invite link is invalid or has expired."}
              </p>
              <Link
                href="/admin/login"
                className="inline-flex font-medium text-brand transition-colors hover:text-[#eaaa33]"
              >
                Go to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="invite-password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="invite-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Create a password"
                    className={cn(fieldClassName, "pr-12")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600"
                  >
                    {showPassword ? (
                      <EyeOff className="size-5" aria-hidden />
                    ) : (
                      <Eye className="size-5" aria-hidden />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="invite-confirm-password" className="sr-only">
                  Confirm password
                </label>
                <Input
                  id="invite-confirm-password"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm password"
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
                {isSubmitting ? "Saving..." : "Save password and continue"}
              </BrandCtaButton>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Already have an account?{" "}
            <Link
              href="/admin/login"
              className="font-medium text-brand transition-colors hover:text-[#eaaa33]"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
