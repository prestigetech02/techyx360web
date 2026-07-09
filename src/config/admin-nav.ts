import {
  ClipboardList,
  LayoutDashboard,
  Mail,
  Newspaper,
  type LucideIcon,
} from "lucide-react"

export type AdminNavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const adminNavItems: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Course Registrations",
    href: "/admin/registrations",
    icon: ClipboardList,
  },
  {
    label: "Contact",
    href: "/admin/contact",
    icon: Mail,
  },
  {
    label: "Blog",
    href: "/admin/blog",
    icon: Newspaper,
  },
]
