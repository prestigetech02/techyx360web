import {
  BarChart3,
  BriefcaseBusiness,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  Rocket,
  Settings,
  ShoppingCart,
  Users,
  UsersRound,
  Wallet,
  type LucideIcon,
} from "lucide-react"

export type AdminNavBadgeKey =
  | "contact"
  | "registration"
  | "pif"
  | "career"

export type AdminNavLeafItem = {
  label: string
  href?: string
  badgeKey?: AdminNavBadgeKey
  comingSoon?: boolean
}

export type AdminNavChildItem = AdminNavLeafItem & {
  children?: AdminNavLeafItem[]
}

export type AdminNavItem = {
  label: string
  href?: string
  icon: LucideIcon
  badgeKey?: AdminNavBadgeKey
  comingSoon?: boolean
  children?: AdminNavChildItem[]
}

export const adminNavItems: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "CRM",
    icon: Users,
    children: [
      {
        label: "Leads",
        href: "/admin/leads",
      },
      {
        label: "Clients",
        href: "/admin/clients",
      },
      {
        label: "Contact Enquiries",
        href: "/admin/contact",
        badgeKey: "contact",
      },
    ],
  },
  {
    label: "Projects",
    href: "/admin/projects",
    icon: FolderKanban,
  },
  {
    label: "Academy",
    icon: GraduationCap,
    children: [
      {
        label: "Course Registrations",
        href: "/admin/registrations",
        badgeKey: "registration",
      },
      {
        label: "Students",
        href: "/admin/students",
      },
    ],
  },
  {
    label: "Programs",
    icon: Rocket,
    children: [
      {
        label: "Product Innovation Fellowship",
        comingSoon: true,
      },
      {
        label: "Bootcamps",
        comingSoon: true,
      },
      {
        label: "Events",
        comingSoon: true,
      },
    ],
  },
  {
    label: "Team",
    href: "/admin/team",
    icon: UsersRound,
  },
  {
    label: "Recruitment",
    icon: BriefcaseBusiness,
    children: [
      {
        label: "Job Listings",
        href: "/admin/job-listings",
      },
      {
        label: "Job Applications",
        href: "/admin/job-applications",
        badgeKey: "career",
      },
      {
        label: "PIF Applications",
        href: "/admin/submissions/pif-applications",
        badgeKey: "pif",
      },
      {
        label: "Talent Pool",
        href: "/admin/talent-pool",
      },
      {
        label: "Talent Requests",
        href: "/admin/talent-requests",
      },
    ],
  },
  {
    label: "Finance",
    icon: Wallet,
    children: [
      {
        label: "Invoices",
        href: "/admin/invoices",
      },
      {
        label: "Expenses",
        comingSoon: true,
      },
      {
        label: "Payments",
        href: "/admin/payments",
      },
    ],
  },
  {
    label: "Orders",
    icon: ShoppingCart,
    children: [
      {
        label: "Service Orders",
        comingSoon: true,
      },
      {
        label: "Hosting",
        href: "/admin/hosting",
      },
      {
        label: "Domains",
        href: "/admin/domains",
      },
    ],
  },
  {
    label: "Content & Marketing",
    icon: Megaphone,
    children: [
      {
        label: "Blog",
        href: "/admin/blog",
      },
    ],
  },
  {
    label: "Reports",
    icon: BarChart3,
    comingSoon: true,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export const pifApplicationsAdminPath = "/admin/submissions/pif-applications"
export const careerApplicationsAdminPath = "/admin/job-applications"
export const talentPoolAdminPath = "/admin/talent-pool"
export const jobListingsAdminPath = "/admin/job-listings"
