import { footerSocialIcons } from "@/config/footer"
import { services } from "@/config/services"
import { getAllCourseRegistrationPaths } from "@/config/training-schools"

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://techyx360.com"

export const siteFavicon = "/techyx360.png"
export const socialShareImage = "/techyx360.png"

export const organization = {
  id: `${siteUrl}/#organization`,
  name: "Techyx360 Technologies Limited",
  alternateName: "Techyx360",
  url: siteUrl,
  logo: `${siteUrl}/techyx360.png`,
  email: "info@techyx360.com",
  phone: "+2349071682117",
  foundingDate: "2022",
  address: {
    streetAddress: "8, Road B, Ladugba Estate, Ita Oluwo",
    addressLocality: "Ikorodu",
    addressRegion: "Lagos",
    postalCode: "",
    addressCountry: "NG",
  },
  sameAs: footerSocialIcons.map((social) => social.href),
} as const

export type IndexableRoute = {
  path: string
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  priority: number
  lastModified?: string
}

export const indexableRoutes: IndexableRoute[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/careers", changeFrequency: "monthly", priority: 0.7 },
  ...services.map((service) => ({
    path: service.href,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  })),
  { path: "/trainings/corporate", changeFrequency: "monthly", priority: 0.8 },
  {
    path: "/trainings/individual-certifications",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  { path: "/trainings/siwes-it", changeFrequency: "monthly", priority: 0.8 },
  { path: "/trainings/bootcamps", changeFrequency: "monthly", priority: 0.8 },
  {
    path: "/trainings/product-innovation-fellowship",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/trainings/product-innovation-fellowship/apply",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/trainings/executive-virtual-assistance",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  { path: "/trainings/register", changeFrequency: "monthly", priority: 0.8 },
  ...getAllCourseRegistrationPaths().map((path) => ({
    path,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  })),
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
]
