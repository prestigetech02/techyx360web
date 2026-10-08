"use client"

import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { BrandCtaButton } from "@/components/ui/brand-cta-button"
import { Input } from "@/components/ui/input"
import { brand } from "@/config/brand"
import {
  getPifPasswordResetCallbackPath,
  PIF_ATTENDANCE_FORGOT_PASSWORD_PATH,
  PIF_ATTENDANCE_HOME_PATH,
} from "@/lib/pifattendance/auth-paths"
import { createClient } from "@/lib/supabase/client"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

const fieldClassName =
  "h-11 rounded-xl border-border bg-background px-3.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

export function PifLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const nextPath = getPifPasswordResetCallbackPath()
    if (nextPath) {
      window.location.replace(nextPath)
    }
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!isSupabaseConfigured()) {
      const message =
        "Supabase is not configured yet. Add your project keys to .env.local."
      setError(message)
      notify.error(message)
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        setError(signInError.message)
        notify.error(signInError.message)
        return
      }

      const verify = await fetch("/api/pifattendance/session", {
        method: "GET",
      })
      const verifyData = (await verify.json().catch(() => null)) as {
        error?: string
      } | null

      if (!verify.ok) {
        await supabase.auth.signOut()
        const message =
          verifyData?.error ??
          "This account is not registered as a PIF fellow."
        setError(message)
        notify.error(message)
        return
      }

      notify.success("Signed in successfully.")
      router.push(PIF_ATTENDANCE_HOME_PATH)
      router.refresh()
    } catch {
      const message = "Unable to sign in right now. Please try again."
      setError(message)
      notify.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const forgotPasswordHref = email.trim()
    ? `${PIF_ATTENDANCE_FORGOT_PASSWORD_PATH}?email=${encodeURIComponent(email.trim())}`
    : PIF_ATTENDANCE_FORGOT_PASSWORD_PATH

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-center px-4">
          <Link href="/" className="inline-flex">
            <Image
              src={brand.logo.light}
              alt={brand.name}
              width={160}
              height={40}
              priority
              className="h-8 w-auto dark:hidden"
            />
            <Image
              src={brand.logo.dark}
              alt={brand.name}
              width={160}
              height={40}
              priority
              className="hidden h-8 w-auto dark:block"
            />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-10">
        <div className="w-full max-w-sm">
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              PIF Attendance
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in with your fellow account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label
                htmlFor="pif-email"
                className="mb-1.5 block text-xs font-medium text-foreground"
              >
                Email
              </label>
              <Input
                id="pif-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@email.com"
                className={fieldClassName}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label
                  htmlFor="pif-password"
                  className="block text-xs font-medium text-foreground"
                >
                  Password
                </label>
                <Link
                  href={forgotPasswordHref}
                  className="text-xs font-medium text-brand hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="pif-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  className={cn(fieldClassName, "pr-11")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden />
                  ) : (
                    <Eye className="size-4" aria-hidden />
                  )}
                </button>
              </div>
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
              {isSubmitting ? "Signing in..." : "Sign in"}
            </BrandCtaButton>
          </form>
        </div>
      </main>

      <footer className="border-t border-border/60 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          For Product Innovation Fellowship fellows only. Need access? Ask your
          facilitator.
        </p>
      </footer>
    </div>
  )
}
