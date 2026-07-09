"use client"

import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

import { BrandCtaButton } from "@/components/ui/brand-cta-button"
import { Input } from "@/components/ui/input"
import { brand } from "@/config/brand"
import { testimonials } from "@/config/testimonials"
import { createClient } from "@/lib/supabase/client"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { cn } from "@/lib/utils"

const fieldClassName =
  "h-12 rounded-xl border-border/80 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:border-brand focus-visible:ring-brand/20 dark:bg-white dark:text-zinc-900"

const featuredTestimonial = testimonials[0]

export function AdminLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    if (!isSupabaseConfigured()) {
      setError(
        "Supabase is not configured yet. Add your project keys to .env.local."
      )
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        return
      }

      router.push("/admin")
      router.refresh()
    } catch {
      setError("Unable to sign in right now. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = async () => {
    setError(null)
    setMessage(null)

    if (!email) {
      setError("Enter your email address first, then click Forgot password.")
      return
    }

    if (!isSupabaseConfigured()) {
      setError(
        "Supabase is not configured yet. Add your project keys to .env.local."
      )
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/admin/login`,
        }
      )

      if (resetError) {
        setError(resetError.message)
        return
      }

      setMessage("Password reset link sent. Check your inbox.")
    } catch {
      setError("Unable to send reset email right now. Please try again.")
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

        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 h-64 w-64"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.18) 1.5px, transparent 1.5px)",
            backgroundSize: "14px 14px",
            WebkitMaskImage:
              "radial-gradient(ellipse at top right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.55) 45%, transparent 72%)",
            maskImage:
              "radial-gradient(ellipse at top right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.55) 45%, transparent 72%)",
          }}
        />

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
              Admin Portal
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#0b2c66] dark:text-white">
              Sign In
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Access the Techyx360 dashboard to manage content and submissions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="admin-email" className="sr-only">
                Email
              </label>
              <Input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Your Email"
                className={fieldClassName}
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <Input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
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

            <div className="flex items-center justify-between gap-4 text-sm">
              <label className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="size-4 rounded border-border text-brand focus:ring-brand/30"
                />
                Remember me
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isSubmitting}
                className="font-medium text-brand transition-colors hover:text-[#eaaa33] disabled:opacity-50"
              >
                Forgot password?
              </button>
            </div>

            {error ? (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            ) : null}

            {message ? (
              <p role="status" className="text-sm text-brand">
                {message}
              </p>
            ) : null}

            <BrandCtaButton
              type="submit"
              className={cn("w-full", isSubmitting && "pointer-events-none opacity-70")}
            >
              {isSubmitting ? "Signing in..." : "Log In"}
            </BrandCtaButton>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Not an admin?{" "}
            <Link
              href="/"
              className="font-medium text-brand transition-colors hover:text-[#eaaa33]"
            >
              Back to website
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
