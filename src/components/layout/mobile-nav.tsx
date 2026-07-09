"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MenuIcon, Minus, Plus, XIcon } from "lucide-react"

import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TiktokIcon,
  TwitterIcon,
} from "@/components/icons/social-icons"
import { Logo } from "@/components/layout/logo"
import { SiteSearchInput } from "@/components/layout/site-search-input"
import { buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { footerSocialIcons } from "@/config/footer"
import { navigation, type NavItem } from "@/config/navigation"
import {
  activeNavChildClass,
  isNavItemActive,
  isNavLinkActive,
} from "@/lib/navigation-active"
import { cn } from "@/lib/utils"

const socialIconMap = {
  Facebook: FacebookIcon,
  X: TwitterIcon,
  LinkedIn: LinkedinIcon,
  Instagram: InstagramIcon,
  TikTok: TiktokIcon,
} as const

function MobileNavLink({
  href,
  children,
  isActive,
  onNavigate,
}: {
  href: string
  children: React.ReactNode
  isActive?: boolean
  onNavigate: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex w-full items-center border-b border-border/60 py-4 text-xs font-semibold text-foreground transition-colors hover:text-brand",
        isActive && "text-brand"
      )}
    >
      {children}
    </Link>
  )
}

function MobileNavGroup({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem
  pathname: string
  onNavigate: () => void
}) {
  const isActive = isNavItemActive(pathname, item)
  const [open, setOpen] = useState(isActive)

  useEffect(() => {
    if (isActive) {
      setOpen(true)
    }
  }, [isActive])

  return (
    <div className="border-b border-border/60">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
        aria-expanded={open}
      >
        <span
          className={cn(
            "text-xs font-semibold text-foreground transition-colors",
            isActive && "text-brand"
          )}
        >
          {item.label}
        </span>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-brand">
          {open ? (
            <Minus className="size-4" aria-hidden />
          ) : (
            <Plus className="size-4" aria-hidden />
          )}
        </span>
      </button>

      {open && item.children && (
        <div className="space-y-1 pb-4 pl-1">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onNavigate}
              className={cn(
                "block rounded-lg px-3 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                isNavLinkActive(pathname, child.href) && activeNavChildClass
              )}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "touch-manipulation min-h-11 min-w-11 shrink-0 text-foreground hover:bg-muted active:bg-muted/80 lg:hidden"
        )}
        aria-label="Open menu"
      >
        <MenuIcon />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full gap-0 p-0 sm:max-w-[380px]"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <Logo className="scale-90 origin-left" />
            <SheetClose
              render={
                <button
                  type="button"
                  className="inline-flex size-9 items-center justify-center rounded-lg text-brand transition-colors hover:bg-brand/10"
                  aria-label="Close menu"
                />
              }
            >
              <XIcon className="size-5" />
            </SheetClose>
          </div>

          <div className="px-5 py-4">
            <SiteSearchInput
              placeholder="Search pages, services, trainings..."
              inputClassName="h-11 rounded-xl border-transparent bg-muted/80 text-sm shadow-none placeholder:text-muted-foreground focus-visible:border-brand/30 focus-visible:ring-brand/20"
              onNavigate={() => setOpen(false)}
            />
          </div>

          <nav className="flex-1 overflow-y-auto px-5">
            {navigation.map((item) =>
              item.children ? (
                <MobileNavGroup
                  key={item.label}
                  item={item}
                  pathname={pathname}
                  onNavigate={() => setOpen(false)}
                />
              ) : (
                <MobileNavLink
                  key={item.label}
                  href={item.href!}
                  isActive={isNavLinkActive(pathname, item.href!)}
                  onNavigate={() => setOpen(false)}
                >
                  {item.label}
                </MobileNavLink>
              )
            )}
          </nav>

          <div className="border-t border-border/60 px-5 py-5">
            <div className="flex items-center gap-3">
              {footerSocialIcons.map((social) => {
                const Icon = socialIconMap[social.label]

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="inline-flex size-10 items-center justify-center rounded-lg bg-muted text-brand transition-colors hover:bg-brand/10 hover:text-brand"
                  >
                    <Icon className="size-4" />
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
