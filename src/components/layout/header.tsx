"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { navigation } from "@/config/navigation"
import { Logo } from "@/components/layout/logo"
import { MobileNav } from "@/components/layout/mobile-nav"
import { SearchDialog } from "@/components/layout/search-dialog"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  activeNavChildClass,
  activeNavLinkClass,
  activeNavTriggerClass,
  isNavItemActive,
  isNavLinkActive,
} from "@/lib/navigation-active"
import { cn } from "@/lib/utils"

const navTriggerClass =
  "h-9 bg-transparent px-2.5 text-sm text-foreground/90 hover:bg-muted hover:text-foreground data-open:bg-muted data-open:text-foreground md:h-10 md:px-3 md:text-base"

function NavLink({
  href,
  isActive,
  className,
  children,
}: {
  href: string
  isActive?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <NavigationMenuLink
      render={<Link href={href} />}
      className={cn(
        navigationMenuTriggerStyle(),
        navTriggerClass,
        isActive && activeNavLinkClass,
        className
      )}
    >
      {children}
    </NavigationMenuLink>
  )
}

function DesktopNav() {
  const pathname = usePathname()

  return (
    <NavigationMenu className="hidden lg:flex">
      <NavigationMenuList className="gap-1 md:gap-1.5">
        {navigation.map((item) =>
          item.children ? (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuTrigger
                className={cn(
                  navTriggerClass,
                  isNavItemActive(pathname, item) && activeNavTriggerClass
                )}
              >
                {item.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul
                  className={cn(
                    "grid gap-1 p-2",
                    item.label === "Services" || item.label === "Trainings"
                      ? "w-[480px] grid-cols-2"
                      : "w-[200px]"
                  )}
                >
                  {item.href && (
                    <li>
                      <NavigationMenuLink
                        render={<Link href={item.href} />}
                        className={cn(
                          "block rounded-lg p-3 hover:bg-muted",
                          isNavLinkActive(pathname, item.href) &&
                            activeNavChildClass
                        )}
                      >
                        <div className="text-sm font-medium md:text-base">
                          {item.label}
                        </div>
                      </NavigationMenuLink>
                    </li>
                  )}
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <NavigationMenuLink
                        render={<Link href={child.href} />}
                        className={cn(
                          "block rounded-lg p-3 hover:bg-muted",
                          isNavLinkActive(pathname, child.href) &&
                            activeNavChildClass
                        )}
                      >
                        <div className="text-sm font-medium md:text-base">
                          {child.label}
                        </div>
                        {child.description && (
                          <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                            {child.description}
                          </p>
                        )}
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ) : (
            <NavigationMenuItem key={item.label}>
              <NavLink
                href={item.href!}
                isActive={isNavLinkActive(pathname, item.href!)}
              >
                {item.label}
              </NavLink>
            </NavigationMenuItem>
          )
        )}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header className="sticky top-0 z-50">
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 border-b transition-all duration-300",
          scrolled
            ? "border-border/30 bg-background/55 backdrop-blur-xl supports-[backdrop-filter]:bg-background/45"
            : "border-border/60 bg-header backdrop-blur-md"
        )}
      />
      <div className="relative z-10 mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:h-[4.5rem] lg:px-8">
        <Logo className="relative z-10 shrink-0" />

        <div className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
          <DesktopNav />
        </div>

        <div className="relative z-20 flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-2.5">
          <SearchDialog className="min-h-11 min-w-11 shrink-0 touch-manipulation md:size-9 [&_svg]:size-5 md:[&_svg]:size-[22px]" />
          <ThemeToggle className="shrink-0 md:h-9 md:px-3.5 md:text-base" />
          <Link
            href="/contact"
            className={cn(
              buttonVariants(),
              "hidden h-8 bg-brand text-brand-foreground hover:bg-brand/90 sm:inline-flex md:h-10 md:px-4 md:text-base"
            )}
          >
            Get Started
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
