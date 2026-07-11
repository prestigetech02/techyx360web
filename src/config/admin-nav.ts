import {
  Building2,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  Mail,
  Newspaper,
  Settings,
  type LucideIcon,
} from "lucide-react"

export type AdminNavChildItem = {
  label: string
  href: string
}

export type AdminNavItem = {
  label: string
  href?: string
  icon: LucideIcon
  children?: AdminNavChildItem[]
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
    label: "Students",
    href: "/admin/students",
    icon: GraduationCap,
  },
  {
    label: "Contact",
    href: "/admin/contact",
    icon: Mail,
  },
  {
    label: "Submissions",
    icon: Inbox,
    children: [
      {
        label: "PIF Application",
        href: "/admin/submissions/pif-applications",
      },
    ],
  },
  {
    label: "Clients",
    href: "/admin/clients",
    icon: Building2,
  },
  {
    label: "Invoices",
    href: "/admin/invoices",
    icon: FileText,
  },
  {
    label: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    label: "Blog",
    href: "/admin/blog",
    icon: Newspaper,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export const pifApplicationsAdminPath = "/admin/submissions/pif-applications"
