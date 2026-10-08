"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { brand } from "@/config/brand"
import { PIF_ATTENDANCE_LOGIN_PATH } from "@/lib/pifattendance/auth-paths"
import { createClient } from "@/lib/supabase/client"
import { notify } from "@/lib/toast"

type PifAttendanceShellProps = {
  userEmail: string | null
  fellowName: string
  children: React.ReactNode
}

export function PifAttendanceShell({
  userEmail,
  fellowName,
  children,
}: PifAttendanceShellProps) {
  const router = useRouter()

  async function handleSignOut() {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      notify.success("Signed out.")
      router.push(PIF_ATTENDANCE_LOGIN_PATH)
      router.refresh()
    } catch {
      notify.error("Unable to sign out right now.")
    }
  }

  return (
    <div className="min-h-dvh bg-[#f4f6fb] dark:bg-[#0b1220]">
      <header className="border-b border-border/60 bg-white dark:bg-[#0f1524]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <Link href="/pifattendance" className="inline-flex shrink-0">
              <Image
                src={brand.logo.light}
                alt={brand.name}
                width={160}
                height={40}
                className="h-7 w-auto sm:h-8 dark:hidden"
              />
              <Image
                src={brand.logo.dark}
                alt={brand.name}
                width={160}
                height={40}
                className="hidden h-7 w-auto sm:h-8 dark:block"
              />
            </Link>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                PIF Attendance
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {fellowName}
                {userEmail ? (
                  <span className="hidden sm:inline">{` · ${userEmail}`}</span>
                ) : null}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 shrink-0 gap-2 rounded-xl px-2.5 sm:px-3"
            onClick={() => void handleSignOut()}
            aria-label="Sign out"
          >
            <LogOut className="size-4" aria-hidden />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  )
}
