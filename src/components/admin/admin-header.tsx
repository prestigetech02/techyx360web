"use client"

import { useRouter } from "next/navigation"
import { Bell, LogOut, Menu, Search } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { createClient } from "@/lib/supabase/client"

type AdminHeaderProps = {
  userEmail?: string | null
}

export function AdminHeader({ userEmail }: AdminHeaderProps) {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  const displayEmail = userEmail ?? "Admin"
  const initial = displayEmail.charAt(0).toUpperCase()

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border/60 bg-white">
        <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex size-10 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-muted lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" />
          </button>

          <div className="relative hidden min-w-0 flex-1 sm:block sm:max-w-md">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              placeholder="Search dashboard..."
              className="h-10 rounded-xl border-border/80 bg-[#f8fafc] pl-9"
            />
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="relative inline-flex size-10 items-center justify-center rounded-xl border border-border/60 bg-white text-zinc-600 transition-colors hover:bg-muted"
            >
              <Bell className="size-5" aria-hidden />
              <span className="absolute top-2 right-2 size-2 rounded-full bg-brand" />
            </button>

            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-white px-2 py-1.5 text-left transition-colors hover:bg-muted sm:px-3"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
                  {initial}
                </span>
                <span className="hidden max-w-[140px] truncate text-sm font-medium text-zinc-700 sm:block">
                  {displayEmail}
                </span>
              </button>

              {profileOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border/60 bg-white p-1 shadow-lg"
                >
                  <div className="border-b border-border/60 px-3 py-2.5">
                    <p className="text-sm font-medium text-zinc-900">Profile</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {displayEmail}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-muted"
                  >
                    <LogOut className="size-4" aria-hidden />
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="relative border-t border-border/60 px-4 py-3 sm:hidden">
          <Search
            className="pointer-events-none absolute top-1/2 left-7 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search dashboard..."
            className="h-10 rounded-xl border-border/80 bg-[#f8fafc] pl-9"
          />
        </div>
      </header>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <AdminSidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
