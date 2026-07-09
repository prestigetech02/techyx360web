import type { NavItem } from "@/config/navigation"

export function isNavLinkActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function isNavItemActive(pathname: string, item: NavItem) {
  if (item.href && isNavLinkActive(pathname, item.href)) {
    return true
  }

  return (
    item.children?.some((child) => isNavLinkActive(pathname, child.href)) ?? false
  )
}

export const activeNavLinkClass =
  "bg-brand/10 font-semibold text-brand hover:bg-brand/15 hover:text-brand"

export const activeNavTriggerClass =
  "bg-brand/10 text-brand data-open:bg-brand/10 data-open:text-brand"

export const activeNavChildClass =
  "bg-brand/10 text-brand hover:bg-brand/15 hover:text-brand"
